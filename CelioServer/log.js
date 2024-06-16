class LOG {

    static raw(...args) {
        console.log.apply(console, args);
    }

    static log(...args) {
        args[0] = new Date().toISOString() + ": " + args[0]; 
        console.log.apply(console, args);
    }

    static info(...args) {
        args[0] = new Date().toISOString() + ": " + args[0]; 
        console.info.apply(console, args);
    }

    static error(...args) {
        console.log(new Date().toISOString() + ":"); 
        console.error.apply(console, args);
    }
    
}

module.exports = LOG;