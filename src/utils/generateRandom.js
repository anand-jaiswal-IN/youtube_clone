function generateRandomOTP(){
    return Math.floor(Math.random()*Math.pow(10,6));
}
console.log(generateRandomOTP());
export {generateRandomOTP}