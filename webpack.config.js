const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        global: './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        // filename: '[name].bundle.js'
        filename: 'scripts.js'
    },
    module: {
        loaders: [{
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader!sass-loader"
            })
        },]
    },
    plugins: [
        new ExtractTextPlugin("./css/style.css"),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin()
    ],
    watch: true,
    devtool: 'cheap-eval-source-map',
    devServer: {
        hot: true,
        contentBase: path.resolve(__dirname, 'dist')
    }
};
