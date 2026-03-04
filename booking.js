// This will store all bookings
const bookings = [];

function chkValidEntry(element){
        return /^[A-D](10|[1-9])$/.test(element);
}

function chkAvailability(seatID, seat_array){
    seatObjFound = seat_array.find((so)=>so.id === seatID);
    return seatObjFound.status == "available";
}

module.exports = {bookings, chkValidEntry, chkAvailability};
