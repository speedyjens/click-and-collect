const sqlite3 = require("sqlite3");
const moment = require("moment");
const { dbGet, dbExec, dbAll } = require("./db-helpers");
const fs = require("fs/promises");
const { isStringInt, formatMomentAsISO } = require("./helpers");
/**
 * Creates frequency data from begin to end
 * @param {sqlite3.Database} db 
 * @param {moment} begin 
 * @param {moment} end 
 */

const TIME_STEPS = [30, 30, 30, 15, 7.5, 5];
async function createFrequencyData(db, begin, end) {
	let previousTimeSlotsInformation = await dbAll(db, `select t.startTime, t.endTime, count(p.id) as booked from timeSlot t 
	left outer join package p on t.id = p.bookedTimeId 
	left outer join queue q on t.queueId=q.id  
	WHERE t.startTime > ? AND 
	t.endTime < ? 
	group by t.startTime, t.endTime 
	ORDER BY t.startTime`, [formatMomentAsISO(begin), formatMomentAsISO(end)]);
	// Vi tager starttime, endtime og antallet af packages der har samme bookedtimeid som timeslottet har id, for alle timeslots indenfor det valgte interval
	let hourTimes = {};

	previousTimeSlotsInformation.forEach((row) => {
		let start = moment(row.startTime);
		let format = start.format("d:HH");

		if (hourTimes[format] == null) {
			hourTimes[format] = [0, 0, ""];
		}
		hourTimes[format][0] += row.booked;
		if (hourTimes[format][2] != start.format("YYYY-MM-DD")) {
			hourTimes[format][1] += 1;
			hourTimes[format][2] = start.format("YYYY-MM-DD");
		}
	});

	Object.entries(hourTimes).forEach(([key, val]) => {
		hourTimes[key] = val[0] / val[1];
	});
	return hourTimes;
}

async function main() {
	db = new sqlite3.Database(__dirname + "/../databasen.sqlite3");

    let databaseCreationCommand = (await fs.readFile(__dirname + "/database_creation.sql")).toString();

    console.log("Configuring database");
    
    /* Execute the database creation commands */
    await dbExec(db, databaseCreationCommand);

    console.log("Database correctly configured");
	let now = moment();

	let hourTimes = await createFrequencyData(db, moment(now).subtract(21, "day"), moment(now).set(0, "second").set(0, "minute").set(0, "hour"));

	let applicableRangeStart = roundUpHour(moment(now));
	let applicableRangeEnd = moment(applicableRangeStart).add(7, "day");

	let lastTimeslot = await dbGet(db, "select * from timeSlot ORDER BY endTime DESC LIMIT 1;");
	
	let beginningTime = roundUpHour(moment(lastTimeslot?.startTime ?? 0));
	
	if (now.isAfter(beginningTime)) {
		beginningTime = roundUpHour(moment(now));
	}

	if (beginningTime.isSameOrAfter(applicableRangeEnd)) {
		console.log("Cant add anything");
	}
	let stores = await dbAll(db, "select s.id, s.openingTime, s.name, SUM(q.size) as queueSizeSum from store s left outer join queue q on s.id = q.storeId group by s.id");

	let timeSlots = [];

	await Promise.all(stores.map(async (store) => {
		let queues = await dbAll(db, "select * from queue where storeId = ?", [store.id]);
	
		await Promise.all(queues.map(async (queue) => {
			let lastTimeSlot = await dbGet(db, "select * from timeSlot where queueId=? order by endTime desc limit 1", [queue.id]);
			let openingTimeObj = JSON.parse(store.openingTime);
			
			let minBeginningTime = roundUpHour(moment(lastTimeSlot?.startTime ?? now));
			let maxEndTime = roundUpHour(moment(now).add(7, "days"));

			/* Check if we already created the necessary time slots */
			if (minBeginningTime.isAfter(maxEndTime)) {
				return;
			}
			
			let timeSlotRanges = [];
			
			let currentDay = minBeginningTime.format("dddd").toLowerCase();
			/*Check if we can any time slots for today*/
			if (openingTimeObj[currentDay].length == 2) {
				/*The closing time is after beginning time*/
				if (isAfter(openingTimeObj[currentDay][1], minBeginningTime)) {
					let closingTimeParts = getTimeParts(openingTimeObj[currentDay][1]);
					let specificClosingTime = moment(minBeginningTime).hour(closingTimeParts.hour).minute(closingTimeParts.minute).second(closingTimeParts.second);
					timeSlotRanges.push([minBeginningTime, specificClosingTime]);
				}
			}
			
			for (let currentTime = moment(minBeginningTime).add(1, "day"); currentTime.isBefore(maxEndTime); currentTime.add(1, "day")) {
				let dayName = currentTime.format("dddd").toLowerCase();
				if (openingTimeObj[dayName].length == 2) {
					let openParts = getTimeParts(openingTimeObj[dayName][0]);
					let closeParts = getTimeParts(openingTimeObj[dayName][1]);

					let specificOpen = moment(currentTime).hour(openParts.hour).minute(openParts.minute).second(openParts.second);
					let specificClose = moment(currentTime).hour(closeParts.hour).minute(closeParts.minute).second(closeParts.second);

					timeSlotRanges.push([specificOpen, specificClose]);
				}
			}
			console.log(timeSlotRanges);

			timeSlotRanges.forEach(range => {
				let currentTime = moment(range[0]);
				while (true) {
					let currentTimeFormat = currentTime.format("d:HH");
					let currentAmount = hourTimes[currentTimeFormat] ?? 0;
					let step = Math.min(Math.ceil(currentAmount / store.queueSizeSum), TIME_STEPS.length - 1);
					let currentLength = TIME_STEPS[step];
					if (moment(currentTime).add(currentLength, "minute").isAfter(range[1])) {
						break;
					}
					
					let end = moment(currentTime).add(currentLength, "minute");

					timeSlots.push([currentTime.format("YYYY-MM-DDTHH:mm:ss"), end.format("YYYY-MM-DDTHH:mm:ss"), store.id, queue.id])
					
					currentTime.add(currentLength, "minute");
				}
			});
		}));
	}));

	await new Promise((resolve, reject) => {
		db.serialize(() => {
			let stmt = db.prepare("INSERT INTO timeSlot (startTime, endTime, storeId, queueId) VALUES (?,?,?,?)");
			db.parallelize(() => {
				timeSlots.forEach(v => {
					stmt.run(v);
				})
			})
			stmt.finalize(() => {
				resolve();
			});
		})
	});

	db.close();
}

function getEarliestTime(openingTime, closingTime, lastTimeSlotEnd) {
	let lastRoundedUp = roundUpHour(lastTimeSlotEnd);
	console.log(lastRoundedUp);
	if (isBetween(openingTime, closingTime, lastRoundedUp, lastRoundedUp)) {
		return lastRoundedUp;
	}
	return null;
}

function getTimeParts(hhmmss) {
	let parts = hhmmss.split(":");
	if (!isStringInt(parts[0]) || !isStringInt(parts[1]) || !isStringInt(parts[2])) {
		return null;
	}
	
	return {
		hour: Number(parts[0]),
		minute: Number(parts[1]),
		second: Number(parts[2])
	};
}

function isBetween(beginhhmmss, endhhmmss, startTimeSlot, endTimeSlot) {
	let formattedStart = startTimeSlot.format("HH:mm:ss");
	let formattedEnd = endTimeSlot.format("HH:mm:ss");
	if (formattedStart >= beginhhmmss && formattedEnd <= endhhmmss) {
		return true;
	} else {
		return false;
	}
}

function isAfter(hhmmss, endTimeSlot) {
	let formattedEnd = endTimeSlot.format("HH:mm:ss");
	if (hhmmss > formattedEnd) {
		return true;
	} else {
		return false;
	}
}


function roundUpHour(m) {
	let roundUp = m.minute() || m.second() || m.millisecond() ? m.add(1, 'hour').startOf('hour') : m.startOf('hour');
	return roundUp;
}

main();