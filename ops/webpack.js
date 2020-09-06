const path = require('path')

module.exports = { 
    target: 'node',
    mode: 'development',

    externals: [],

    entry: { 
      entry: './src/entry.js',
    },

    output: {
      path: path.join(__dirname, '../build'),
      filename: 'eth.js',
      library: 'eth',
      libraryExport: 'default',
      libraryTarget: 'assign',
    },

    resolve: {
      extensions: ['.js', '.json']
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
            },
          },
        },
      ],
    },
}
