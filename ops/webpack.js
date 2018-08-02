const path = require('path')

module.exports = {

  target: 'node',
  mode: 'development',
  externals: ['electron'],

  entry: {
    bundle: './src/entry.js',
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
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['env'], },
        },
      },
    ],
  },

}
