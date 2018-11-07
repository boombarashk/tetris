module.exports = {
    mode: "production",
    entry: {
        "app.min": ["@babel/polyfill", './app/assets/app.js'],
        "test.spec": './app/test/index.js',
    },
    devtool: "source-map",
    output: {
        filename: "[name].js"
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
    },
}