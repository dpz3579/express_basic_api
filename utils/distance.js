function toRad(Value){ return Value * Math.PI / 180; }

function CalculateDistance(lat1, lon1, lat2, lon2) {
  let R = 6371; // km
  let dLat = toRad(lat2-lat1);
  let dLon = toRad(lon2-lon1);
  let lat_1 = toRad(lat1);
  let lat_2 = toRad(lat2);

  let a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat_1) * Math.cos(lat_2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  let d = R * c;
  return {meters : d * 1000, kms: d};
}

module.exports = {
  CalculateDistance
};
