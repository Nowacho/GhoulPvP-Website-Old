const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const routes = require('./routes/routes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'styles')));
app.use(express.static(path.join(__dirname, 'components')));

// Session configuration
app.use(session({
    secret: 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Using routes
app.use(routes);

// Start the server
app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});

// Passport configuration with Discord
passport.use(new DiscordStrategy({
    clientID: 'TU_CLIENT_ID',
    clientSecret: 'TU_CLIENT_SECRET',
    callbackURL: `http://localhost:${port}/callback`,
    scope: ['identify', 'email']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});
