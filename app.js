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
		const bookingID = req.params.bookingID;
		const foundBookingObj = pending_bookings.find((po)=> po.id == bookingID)
		///last left here - fix foreach loops issues and lock expiry checks!!!!
		if(foundBookingObj){			
			for(const ID of foundBookingObj.seats){
				var currentStatus = true;
				if(foundBookingObj.expiresAt < Date.now()){
					resetSeat(ID, seats.seats)
					currentStatus = false;
				}
			}
			if(!currentStatus){return res.status(410).json({message:`bookingid ${bookingID}'s locked time expired`});}
			else{
				// confirmBooking(seats.seats, foundBookingObj.seats)
				
				for(const lockedSeat of foundBookingObj.seats){
						const seatToBook = seats.seats.find((so)=> so.id === lockedSeat);
						seatToBook.status = "booked";
				}
				confirmed_bookings.push(foundBookingObj);
				res.status(200).json({message:`confirmed ${bookingID} in pending_bookings`, "confirmed booking":confirmed_bookings});	
			}
		}else{
			res.status(404).json({message:`bookingid ${bookingID} does not exist in pending_bookings`});
		}		
});

//start server
app.listen(port ,()=>{
	console.log(`Server started at http://localhost:${port}`);
})
