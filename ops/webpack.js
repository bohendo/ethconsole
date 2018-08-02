const path = require('path')

module.exports = {

  target: 'node',
  mode: 'production',
  externals: ['electron'],

  entry: {
    console: './src/entry.js',
  },

  output: {
    path: path.join(__dirname, '../build'),
    filename: 'bundle.js',
    library: 'web3',
    libraryExport: 'default',
    libraryTarget: 'assign',
  },

  resolve: {
    extensions: ['.js', '.json'],
    // scrypt.js says "if target is node, use c++ implementation"
    // but I don't want any c++, let's force the js version to load
    alias: { 'scrypt.js': 'scryptsy' },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['env'], },
        },
        exclude: /node_modules/,
      },
    ],
  },

}
