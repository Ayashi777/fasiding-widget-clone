const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack'); 

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    return {
        entry: path.join(__dirname, 'src/index.tsx'),
        output: {
            path: path.join(__dirname, 'dist'),
            filename: isDevelopment ? 'js/[name].bundle.js' : 'js/bundle.js',
            chunkFilename: isDevelopment ? 'js/[name].chunk.js' : 'js/[id].chunk.js',
            publicPath: '/',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    exclude: /node_modules/,
                    use: 'ts-loader'
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: 'babel-loader'
                },
                {
                    test: /\.css$/,
                    use: [
                        isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(png|jpg|gif|svg)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[name][ext]'
                    }
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext]'
                    }
                }
            ]
        },
        plugins: [
            new Dotenv({
                path: path.resolve(__dirname, '.env'), // Явный путь к .env файлу
            }),
            new HtmlWebpackPlugin({ template: './public/index.html' }),
            new CleanWebpackPlugin(),
            !isDevelopment && new MiniCssExtractPlugin({ filename: 'css/[name].bundle.css' })
        ].filter(Boolean),
        devServer: {
            hot: true,
            port: 3000,
            open: true,
            historyApiFallback: {
              rewrites: [
                { from: /^\/widget\/.*$/, to: '/index.html' },
              ],
            },
        },          
        devtool: isDevelopment ? 'source-map' : false
    };
};
