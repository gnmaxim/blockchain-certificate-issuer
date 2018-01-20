const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    entry: './app/javascripts/app.js',

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'app.js'
    },

    plugins: [
        // Copy our app's index.html to the build folder.
        new CopyWebpackPlugin([{ from: './app/index.html', to: "index.html" }]),
        new webpack.ContextReplacementPlugin(/simple-node-db/, 'SimpleNodeDb.js')
    ],

    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ],

        loaders: [
            { test: /\.json$/, use: 'json-loader' },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-runtime']
                }
            },
            {
                test: /\.sol$/,
                loaders: ['solc-loader']
            }
        ]
    },
    
    node: {fs: 'empty'}
}
