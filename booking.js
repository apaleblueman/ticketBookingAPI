// This will store all bookings
const confirmed_bookings = [];
const pending_bookings = [];
function chkValidEntry(element){
        return /^[A-D](10|[1-5])$/.test(element);
}

function chkAvailability(seatID, seat_array){
    seatObjFound = seat_array.find((so) => so.id === seatID);
    return (seatObjFound.status == "available");
}



function resetSeat(seatID, seat_array){
    seat_array.forEach(seatObj => {
        if(seatObj.id === seatID){
            seatObj.status = "available";
            seatObj.bookingId = null;
            seatObj.lockExpiry = null;
            seatObj.lockedAt = null;
            seatObj.lockedBy =null;
        }
    });
}
module.exports = {confirmed_bookings, pending_bookings, chkValidEntry, chkAvailability,resetSeat};
