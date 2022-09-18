# crypto-csv-cli

A command line program tracks your crypto portfolio from CSV file

I built this CLI with the intention of keeping it simple, lightweight, open to upgrade and maintain, while providing an continous/non-disruptive experience for the users.

Below are some noteworthy points from my POV:

1. **The CSV file is "cloned" into a JSON file**
   During the initialization phase of the program, the CSV file is parsed once into the `portfolio.json` file for these reasons:
   - Strict typings could be applied for `json` files. This is preferable for a Typescript project.
   - While `csv` is excellent with small files, `json` is superior while working with huge volume of data, and in terms of scalability.
   - The `json` file could serve as a "convenient global state" available to every file, and completely compatible with native `javascript` methods. On the contrary, the `csv` file requires parsing for every file-reading attempt.

<br>

2. **Self-built interface for the CLI**

   The interface is built with native packages. At first I tried some third parties (`commanderjs`, `inquirer`, `yargs`, etc.), however they failed to bring the aforementioned "non-disruptive" UX.

   The interaction flow I was trying to create:

   - Display the help panel, showing available commands with options, asking for the input.
   - Read the input, perform the according task.
   - Showing result.
   - Display the help panel again without exiting the NodeJS process. Only exit if the user wants to.

   <br>

   The first 3 things with third party libs are quite straightforward. However I couldn't figure out a way to keep the process alive after finish the first task. And, they seem to be quite "heavy" for a simple task of asking for user's input.

   Therefore the interface is built with a native prompt package. The commands hierachy and their arguments are defined by simple key/value mappings inside the `config.ts` file. This would make the command logic open for upgrade, for example when you need to add a new command, or an argument for a command.

<br>

3. **Composition over optimization**

   In the requirements, there are 4 tasks when it comes to track the portfolio value. This is how I "translated" those tasks

   - Get the current price of all tokens symbol at the current time
   - Get the current price of a specified token symbol
   - Get the price of all tokens at specified time
   - Get the price of a specified token symbol at specified time

   <br>

   These four tasks could be solved with a single API endpoint (`Day Pair OHLCV by TS`), which accepts parameters including **one specified token** and the specified timestamps. Therefore, in the `Api` class, there's only one api method `getSymbolPrice` for querying the price for a symbol at a certain timestamps. Every network request to query the value (of one or many symbols) in USD is a composition of this method.

   `CryptoCompare` actually provides an endpoint to query the current price of **many symbols** (they don't have the same endpoint for the historical price data), but I prefered to use the endpoint querying **one symbol** at a time. This is not optimized for the API provider.

   For example, I have 3 symbols BTC, ETH, BNB within the portfolio, if I were to use the **many** endpoint, the API provider would just have to deal with one request. However since I'm not, they have to process 3 requests. And I have my reasons:

    - `CryptoCompare` don't have the endpoint to query historical price for many symbols. And I will have to adopt composition anyway, only at a lesser degree.
    - Their servers can handle it. For personal use it's hard to surpass 100,000 network requests monthly
    - This is not my server, and I can always get a new key for free.

   <br>

   The benefits for the tradeoff are quite considerable: The code is more composed and free from duplicative logic, and somewhat more readable and maintainable.
