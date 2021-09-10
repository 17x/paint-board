// const webpack = require('webpack');
// const WebpackCleanPlugin = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.base.js');

module.exports = merge(
    common,
    {
        mode : 'production'
    }
);