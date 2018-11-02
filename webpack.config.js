module.exports = {
    mode: "production",
    entry: ["@babel/polyfill", './app/assets/tetris.js'],
    devtool: "source-map",
    output: {
        filename: "app.min.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
        ]
    }
}