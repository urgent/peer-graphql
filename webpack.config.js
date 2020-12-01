const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: './src/index.ts',
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