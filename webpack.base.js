const webpack = require('webpack');
const path = require('path');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let entrys = {
    'paint-board' : './src/index.js'
};

let plugins = [
    // new BundleAnalyzerPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({
        maxChunks : 1
    })
];

let modules = {
    rules : [
        {
            /*jsx 使用babel-jsx处理*/
            test : /\.js$/,
            exclude : [/node_modules/],
            use : [
                'babel-loader'
            ]
        }
    ]
};

let output = {
    clean : true,
    filename : '[name].min.js', // chunkFilename : '[name].[hash].js',
    path : path.resolve(__dirname, 'build'),
    // publicPath : '/',
    publicPath : ''
};

module.exports = {
    entry : entrys,
    module : modules,
    plugins : plugins,
    output,
    // resolve : resolves,
    // optimization : optimization
};
