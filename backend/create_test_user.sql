INSERT INTO store (id, name, openingTime, pickupDelay, apiKey, storeEmail) VALUES
	(4563, "dkfaoef", 
'{monday: ["08:00:00", "17:00:00"],' || 
'tuesday: ["08:00:00", "17:00:00"],' ||
'wednesday: ["08:00:00", "17:00:00"],' ||
'thursday: ["08:00:00", "17:00:00"],' ||
'friday: ["08:00:00", "17:00:00"],' ||
'saturday: ["08:00:00", "17:00:00"],' ||
'sunday: ["08:00:00", "17:00:00"]}', 
"00:00:00", "ksokg", "dkfaoef@mail.com");

--demo web shop
INSERT INTO store (id, name, openingTime, pickupDelay, apiKey, storeEmail) VALUES
	(2, "Demo shop", '{monday: ["08:00:00", "17:00:00"],' || 
'tuesday: ["08:00:00", "17:00:00"],' ||
'wednesday: ["08:00:00", "17:00:00"],' ||
'thursday: ["08:00:00", "17:00:00"],' ||
'friday: ["08:00:00", "17:00:00"],' ||
'saturday: ["08:00:00", "17:00:00"],' ||
'sunday: ["08:00:00", "17:00:00"]}', "00:00:00", "demo-shop-94835577175941", "demo-shop@mail.com");

--password is "password"
INSERT INTO user (username, password, salt, name, superuser, storeId) VALUES
	("bob", "e7620ce600f3434e87dc9bfdaacdcf473f98f1275838f74f92c7e928da4a76a24d134576898ec1143f9603b025850f9e269af92d7e068f31dec31bb07c97cebc", "abcdefg", "bob", 0, 4563);

--password is "hunter2"
INSERT INTO user (username, password, salt, name, superuser, storeId) VALUES
	("superbob", "ecb71788886af823e32cd74d22a4fe2712cc579cd0783030ff75e54272191e3d3d9f4b4e156623119f8e2d2fa55cb84cc897a700171aec3ed7617a7602c80fa4", "akrogd", "bob", 1, 4563);