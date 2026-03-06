const express = require('express');
const seats = require('./seats.js');
const { chkValidEntry, chkAvailability,resetSeat, pending_bookings,confirmed_bookings} = require('./booking.js');
const { Mutex } = require('async-mutex');
const bookingMutex = new Mutex();
const port = 3000;
const app = express();
app.use(express.json());
//get seats info using
//get routes
app.get('/', (req, res)=>{
	res.json({
			"message": "Welcome to Ticket Booking API",
			"endpoints": {
			"seats": "/seats"
  }});
})
//get seats
app.get('/seats', (req, res)=>{
	let results = seats.seats;
	const queryFilter = req.query;
	if(queryFilter.status){results = results.filter((seatObj)=>seatObj.status === queryFilter.status);}
	if(queryFilter.row){results = results.filter((seatObj)=>seatObj.row.toLowerCase() === queryFilter.row.toLowerCase());}
	if(results.length<=0){
		return res.status(200).json({queryFilter,message:"no data available for this filter"})
	}
	res.status(200).json({message:`seats`,queryFilter,results})
})

//post route for locking seats
app.post('/bookings', async (req, res)=>{
	const userInfo = req.body;
	if(!userInfo.mobile || userInfo.mobile.length !== 10 || !userInfo.seats || userInfo.seats.length > 10 || userInfo.seats.length <= 0){
		return res.status(400).json({message:"only 10 digit mobile numbers and no more that 10 seats allowed"});
	}
	
	//remove duplicates
	userInfo.seats = [...new Set(userInfo.seats)];

	for(const seatElement of userInfo.seats) {
		if(!chkValidEntry(seatElement)) {
			return res.status(400).json({message: `Invalid seat ID: ${seatElement}`});
		}
		if(!(chkAvailability(seatElement, seats.seats))){
			return res.status(409).json({message:`seat ${seatElement} already taken`});
		}
	}
	//critical section
	const release = await bookingMutex.acquire();
	try{
		//validating again
		for(const seatElement of userInfo.seats) {
			if(!(chkAvailability(seatElement, seats.seats))){
				return res.status(409).json({message:`seat ${seatElement} already taken`});
			}
		}
		//locking each seat user requested
		const bookingId = crypto.randomUUID();
		const lockExpiry = Date.now() + (5 * 60 * 1000);  // 5 minutes from now
		
		
		for(const userSeat of userInfo.seats){
			const seatToLock = seats.seats.find((so)=>so.id === userSeat);
			seatToLock.status = "locked";
			seatToLock.bookingId = bookingId;
			seatToLock.lockExpiry = lockExpiry;
			seatToLock.lockedAt = Date.now();
			seatToLock.lockedBy = bookingId;
		}
		const pendingBooking = {
			id: bookingId,
			mobile: userInfo.mobile,
			status: "pending",
			seats: userInfo.seats,
			expiresAt: lockExpiry,
			createdAt: Date.now(),
			totalSeats: userInfo.seats.length
		}
		pending_bookings.push(pendingBooking);
		res.status(201).json({message:`locked following seats`,userInfo, "current pending booking":pendingBooking});		
			
	} finally{
		release();
	} 
	
});
//post route for booking after payment
app.post('/bookings/:bookingID/confirm', (req,res)=>{
		const userBookingID = req.params.bookingID;
		const bookingRecord = pending_bookings.find((po)=>po.id === userBookingID);
		if(!bookingRecord){res.status(404).json({message:`booking record ${userBookingID} does not exist!`})}
		if(bookingRecord.expiresAt < Date.now()){
			for(const lockedSeat in bookingRecord.seats){
				const seatFound = seats.seats.find((so)=>so.id === lockedSeat);
				seatFound.status = "available";
				seatFound.bookingId = null;
				seatFound.lockExpiry = null;
				seatFound.lockedAt = null;
				seatFound.lockedBy =null;
			}
			const indexToRemove = pending_bookings.findIndex((po)=>po.id === userBookingID);
			pending_bookings.splice(indexToRemove, 1);
			res.status(410).json({message:"Booking record's lock expired!"})
		}
		else{
			for(const lockedSeat of bookingRecord.seats){
				const seatToConfirm = seats.seats.find((so)=>so.id === lockedSeat);
				if(!seatToConfirm){return res.status(409).json({message:`seat ${seatToConfirm.id} does not exist!`})}
				if(seatToConfirm.status !== "locked"){return res.status(409).json({message:`seat ${seatToConfirm.id} is not locked!`})}
				if(seatToConfirm.lockedBy !== userBookingID){return res.status(409).json({message:`seat ${seatToConfirm.id} locked by another booking ID`})}
				
			}

			for(const lockedSeat of bookingRecord.seats){
				const seatToConfirm = seats.seats.find((so)=>so.id === lockedSeat);
				seatToConfirm.status = "booked";
			}
			res.status(200).json({message:`seat ${bookingRecord.seats} booked succesfully`})


		}
});

//start server
app.listen(port ,()=>{
	console.log(`Server started at http://localhost:${port}`);
})
