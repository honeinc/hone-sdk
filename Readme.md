
# Hone Embed

  A simple tool, to work with Hones postmessage from embeded Hone's

## Warning

  This is still pending on an update to the Hone App itself, watch repo to see updates.

## Installation

  Include the script into your page ( script located in `build` directory ).

    <script src="/path-to/embed.min.js"></script>

## Usage

  After you load the script we export out a `hone` variable into the `window`, or global scope. You can attach event bindings to that variable.

    hone.on('buy_button_clicked', function( e ){
      console.log('Clicked the buy button');
    })

## Available Events

  Coming Soon

## Examples 

  Checkout the `examples` directory

## Contributing

  You will need `grunt` cli.


    $ npm install grunt-cli -g

  Then install dev dependecies

    $ npm install

  To build embed script

    $ grunt


## License

  The MIT License (MIT)

  Copyright (c) 2014 <copyright holders>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.