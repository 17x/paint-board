const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.base.js');
const ip = require('ip');

module.exports = merge(common, {
    mode : 'development', // devtool: 'source-map',
    plugins : [
        // new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    devtool : 'source-map',
    devServer : {
        host : ip.address(),
        clientLogLevel : 'silent',
        port : 8085,
        // historyApiFallback : true,
        //open: '/editor.html',
        compress : false,
        // open : true,
        stats : { colors : true },
        contentBase : './public/'
    }
});
