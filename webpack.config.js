const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require("fs");
const Dotenv = require('dotenv-webpack');
const dotenv = require('dotenv').config();

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
      publicPath: '/'
    },
   
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer')
                  ]
                }
              }
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[hash][ext][query]'
          }
        }
      ]
    },
    resolve: {
      fallback: {
        os: require.resolve("os-browserify/browser"),
        buffer: require.resolve("buffer/"),
        vm: require.resolve("vm/"),
        path: require.resolve("path-browserify"),
        crypto: require.resolve("crypto-browserify"),
        https: require.resolve("https-browserify"),
        url: require.resolve("url"),
        assert: require.resolve("assert"),
        http: require.resolve("stream-http"),
        stream: require.resolve("stream-browserify")
      },
      extensions: ['.js', '.jsx']
    },
    plugins: [
      new HtmlWebpackPlugin({template: './public/index.html'}),
      new Dotenv({
        path: '.env', // Path to .env file
        safe: false, // Don't require .env.example
        silent: false // Show errors if .env file is missing
      })
    ],
    devServer: {
      historyApiFallback: true,
      port: process.env.PORT,
      host: process.env.HOST,
      hot: true,
      // Add local HTTPS configuration
      server: {
        type: 'https',
        options: {
          key: fs.readFileSync(path.resolve(__dirname, './ssl/server.key')),
          cert: fs.readFileSync(path.resolve(__dirname, './ssl/server.crt')),
        }
      }
    },
    performance: {
      hints: false,
      maxEntrypointSize: 312000,
      maxAssetSize: 312000,
    },
    mode: process.env.NODE_ENV || 'development',
    devtool: 'eval-source-map'
  };
};