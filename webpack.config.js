const path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: './src/index.ts',
    target: 'node',
    externals: [nodeExternals()],
    output: {
        path: path.resolve('lib'),
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env',
                            '@babel/react', {
                                'plugins': ['@babel/plugin-proposal-class-properties']
                            }]
                    }
                }
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
    externals: {
        react: 'react',
        'relay-runtime': 'relay-runtime',
        yaml: 'yaml',
        'react-relay': 'react-relay'
    }
};