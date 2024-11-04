const express = require('express')
const dotenv = require('dotenv');
const bodyparser = require('body-parser')
const cookieParser = require('cookie-parser');
const socketIo= require('socket.io')

const app = express()


const users ={}

// Load environment variables
dotenv.config({ path: '.env' }); 

const cors = require('cors')

app.use(cors({
    origin: ['http://localhost:3000' , 'http://192.168.29.64:3000'], //Isme tu sirf apni website ko allow karta hai, apni API se data lene ka right milega. 
    credentials: true, //  Yaha cookies, tokens wagairah ko send kar sakta hai safely.
  }));

  app.use(express.json()) //^JSON data samajhne me aasan ho jata hai
  app.use(cookieParser()) //^ Cookies chhoti-chhoti info hoti hai jo browser me store hoti hai
  app.use(bodyparser.json());  //^Yeh bhi JSON data ko samajhne ke liye hai
  app.use(bodyparser.urlencoded({extended:true})) //^Yeh URL format me form data handle karta hai,

app.get('/',(req,res)=>{
    res.send("scerver is warimgggg")
})



const PORT = process.env.PORT || 4000;

const server =app.listen(PORT,()=>{
    console.log(`server is warking on http://localhost:${PORT} `)

    

    const io=socketIo(server,{
        origin: ['http://localhost:3000', 'http://192.168.29.64:3000'],
        methods: ["GET", "POST"]
    })

    io.on('connection',(socket)=>{   //$ Listen for incoming Socket.IO connections
        console.log('new client connected:',socket.id);
        
        
     socket.on('joined',({user})=>{   //$ Listen for incoming Socket.IO connections
        users[socket.id] = user
        console.log(`${user} has join`);
        
        socket.broadcast.emit('userJoined', { user: "Admin", message: `${users[socket.id]} User has joined` });
        
        socket.emit('wellcome',{user:"Admin",message:`Wellcome to Chat: ${users[socket.id]}`})


    })

    socket.on('message',({message,id})=>{
    io.emit("sendMessage",{user:users[id],message,id})
    })


     // Handle client disconnection
     socket.on('disconnect', () => {
        socket.broadcast.emit('leave', { user: "Admin", message: `${users[socket.id]} has left` });
        console.log('user disconnected:', socket.id);
    });

        
    })

})