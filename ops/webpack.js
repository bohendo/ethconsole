const path = require('path')

module.exports = { 
    target: 'node',
    mode: 'development',

    externals: [],

    resolve: {
      extensions: ['.js', '.json', '.ts'],
      mainFields: ["main", "module"],
      symlinks: false,
    },

    entry: { 
      entry: './src/entry.ts',
    },

    output: {
      path: path.join(__dirname, '../build'),
      filename: 'eth.js',
      library: 'eth',
      libraryExport: 'default',
      libraryTarget: 'assign',
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.join(__dirname, "../tsconfig.json"),
            },
          },
        },
      ],
    },
}
