const fastify = require('fastify');
const fastifyCors = require('fastify-cors');                       // import the  require packages
const app = fastify();
const corsOptions = {
    origin: '*',
    methods: 'OPTION, GET,HEAD,PUT,PATCH,DELETE',                       //cors protocol is understood specific methods and headers
    preflightContinue: false,
    optionsSuccessStatus: 204,
    exposedHeaders: 'Authorization'
};
const PORT = 3000;                                                  //PORT NUMBER
app.register(fastifyCors, corsOptions);
app.get('/ping', (req, reply) =>{                                  //call the end point /ping and the response is pong
    reply.send('pong');
});
app.listen(PORT, function () {
    console.log(`Facts Events service listening at http://localhost:${PORT}`);       //server is now listen here
});
let clients = [];                                                                          
function eventsHandler(req,reply){                                
    const headers = {
        'Content-Type': 'text/event-stream',                                      
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    reply.raw.writeHead(200, headers);                                                  
    reply.raw.write(JSON.stringify({ txt: new Date() }));                        //write the response of date in JSON
    console.log("============>",reply);
    const clientId = req.id;
    const newClient = {
        id: clientId,
        response: reply
    };
    clients.push(newClient);                                                    
    listenEvent();                                                              // call the function of listenEvent
    req.raw.on('close',() => {
        console.log(`${clientId} Connection closed`);                           //print the clientid and connection closed
        clients = clients.filter((client) => client.id !== clientId);             
    });
}
function listenEvent(){
    const interval = setInterval(() => {
        clients.forEach((client)=>{
            client.response.raw.write(JSON.stringify({ txt:new Date()}));           
            // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",client)
        });
        if (clients.length == 0){
            clearInterval(interval);
        }
    }, 1000);
}
app.get('/sse', eventsHandler);                                                     // call the endpoint eventsHandler function will be called

app.listen(3000, function(){
    console.log('App is running');
});

