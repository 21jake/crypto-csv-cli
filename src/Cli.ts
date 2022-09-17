import readline from 'readline';
import { Args, Commands, commandsHierachy } from './config';
import { PortfolioTracker } from './PortfolioTracker';
import { performance } from 'perf_hooks'

interface ICli {
  read: () => void;
  greet: () => void;
}

export class Cli implements ICli {
  rl: readline.Interface;
  commandTaskMapping: { [keys in Commands]: Function };

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.commandTaskMapping = {
      [Commands.HELP]: this.listCommands,
      [Commands.EXIT]: this.exit,
      [Commands.INSPECT]: this.inspect,
    };
  }

  public greet() {
    console.log('#####################################################################');
    console.log('Welcome to the CLI. Track your crypto portfolio with simple commands.');
    console.log(' ');
    this.listCommands();
  }

  public read() {
    this.rl.question("$ ", (command) => {
      this.handle(command);
      this.read();
    });
  }

  private handle(userInput: string) {
    const fullCommand = this.trim(userInput);
    const [commandName, ...args] = fullCommand.split(' ');

    const isValidCommand = Object.values(Commands).includes(commandName as Commands);
    if (!isValidCommand) {
      console.log(`Unrecognized command '${commandName}'. Check your spelling. Type "help" for a list of available commands.`);
      return;
    }

    const validCommand = commandName as Commands;
    const task = this.commandTaskMapping[validCommand];

    const keyValuesArgs = this.getKeyValuesCommandArgs(args);
    const validArgs = this.validateArgs(validCommand, keyValuesArgs);
    if (!validArgs) return;
    
    task(fullCommand, keyValuesArgs);
  }

  private validateArgs(command: Commands, args: Args) {
    // Validate arguments by Command Name
    // 1. Check if provied arguments are valid for the corresponding command
    // 2. If an argument is provided, check if it has a value

    let result = true;
    const argsByCommand = commandsHierachy[command].args;
    if (!argsByCommand) return result;
    for (const key in args) {
      const element = args[key];
      if (!argsByCommand[key] || !element) {
        console.log(`Either empty or unrecognized argument: '${key}'`);
        console.log('------------------------------------------------');
        result = false;
        break;
      }
    }
    
    return result;
  }

  private listCommands() {
    console.log('Usage: <COMMAND> [<argument key> <argument value>...]');
    console.log('Example: inspect -d 2021/12/10 -t ETH');
    console.log('Available commands:');
    for (const c in commandsHierachy) {
      const command = c as Commands;
      const argumentAttributes = commandsHierachy[command];
      console.log(`\t${command}: ${argumentAttributes.description}`);

      if (argumentAttributes.args) {
        for (const argKey in argumentAttributes.args) {
          console.log(`\t\t${argKey}: ${argumentAttributes.args[argKey]}`);
        }
      }
    }
    console.log('');
  }

  private trim(command: string) {
    return command.replace(/\s\s+/g, ' ').trim();
    
  }

  private exit = () => {
    this.rl.close();
    console.log('Gracefully exiting...');
    process.exit(0);
  };

  private inspect(command: string, args: Args) {
    const tracker = new PortfolioTracker(args);
    const startTime = performance.now()
    console.log(`Start executing command: ${command}`);
    
    tracker.track().then(() => {
      const endTime = performance.now()
      console.log(`Command executed. Execution time: ${((endTime - startTime)/1000).toFixed(4)} seconds`);
    }).catch((err) => {
      console.log(err);
    });
    
  }

  private getKeyValuesCommandArgs = (args: string[]): Args => {
    // From "-d 12/10/1999 -t ETH"
    // To { '-d': '12/10/1996', '-t': 'ETH' }
     const keyValues: { [key: string]: string} = {};
     for (let i = 0; i < args.length; i++) {
         if (args[i].startsWith('-')) {
             keyValues[args[i]] = args[i + 1];
         }
     }
     return keyValues;
 }
}
