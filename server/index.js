// Process starts from here
function alert(v) {
    console.log(v);
}

alert("hello");
const a = 0;
if (a == 1) {
    console.log("Hello, world");
}

exports.handler = async(event) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};