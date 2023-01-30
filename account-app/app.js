const express = require('express');
const amqp = require("amqplib");
const app = express();
const Account = require('./Account');
const port = process.env.PORT || 4001;

var connection, channel;
var exchange = 'logs';

let a1 = new Account(1, 1000, 6);

a1.on('depositSuccess', (balance)=>{
    var data = {
        from: "Accounts",
        value: `Amount Deposited - New Account Balance is: INR ${balance}`
    }
    sendData(data);
    console.log("A message is published to the queue");
    //res.send("Message Published...");
});

a1.on('withdrawSuccess', (balance)=>{
    var data = {
        from: "Accounts",
        value: `Amount Withdrawn - New Account Balance is: INR ${balance}`
        }
    sendData(data);
    console.log("A message is published to the queue");
    //res.send("Message Published...");
});

a1.on('withdrawFailure', (balance)=>{
    var data = {
        from: "Accounts",
        value: `Amount Withdraw Failed - New Account Balance is: INR ${balance}`
        }
    sendData(data);
    console.log("A message is published to the queue");
    //res.send("Message Published...");
});

async function connectQueue() {
    try {
        connection = await amqp.connect("amqp://localhost:5672");
        console.log(`Account Application connected to RabbitMQ`);
        channel = await connection.createChannel();
        await channel.assertExchange(exchange, 'fanout', {
            durable: false
        });
    } catch (error) {
        console.log(error);
    }
}


async function sendData(data) {
    await channel.publish(exchange, '', Buffer.from(JSON.stringify(data)));
}


app.post('/deposit', (req, res) => {
    // res.send("Hello World!");
    a1.deposit(1000);
    res.send("Deposited...")
    
    
});

app.post('/withdraw', (req, res) => {
    // res.send("Hello World!");
    a1.withdraw(1000);
    res.send("Withdraw procedure started...");


});

app.listen(port, () => {
    console.log(`Account Application started on port ${port}`);
    connectQueue();
});