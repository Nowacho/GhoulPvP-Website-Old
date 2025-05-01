const express = require('express');
const path = require('path');
const passport = require('passport'); // Agrega esta línea

class routes {
    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'pages', 'home.html'));
        });

        this.router.get('/login', passport.authenticate('discord'));

        this.router.get('/callback',
            passport.authenticate('discord', { failureRedirect: '/' }),
            (req, res) => {
                // If the login is successful, redirects the user to the profile page.
                res.redirect('/profile');
            }
        );

        this.router.get('/profile', (req, res) => {
            if (!req.isAuthenticated()) {
                return res.redirect('/');
            }
            res.send(`<h1>Hola, ${req.user.username}</h1><p>Email: ${req.user.email}</p>`);
        });

        this.router.get('/host', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'pages', 'host.html'));
        });

        this.router.get('/leaderboard/uhc', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'pages', 'leaderboard', 'uhc.html'));
        });

        this.router.get('/leaderboard/meetup', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'pages', 'leaderboard', 'meetup.html'));
        });

        this.router.get('/threads', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'pages', 'threads', 'threads.html'));
        });

        this.router.get('/staff', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'pages', 'staff.html'));
        });

        this.router.get('/policy', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'pages', 'policy.html'));
        });

        this.router.get('/u/:playerName', (req, res) => {
            const playerName = req.params.playerName;
            res.sendFile(path.join(__dirname, '..', 'pages', 'profile.html'));
        });

        this.router.get('/panel', (req, res) => {
            res.sendFile(path.join(__dirname, '..', 'pages', 'panel', 'panel.html'));
        });

        this.router.get('/host.html', (req, res) => {
            res.redirect('/host');
        });

        this.router.get('/leaderboard/uhc.html', (req, res) => {
            res.redirect('/leaderboard/uhc');
        });

        this.router.get('/leaderboard/meetup.html', (req, res) => {
            res.redirect('/leaderboard/meetup');
        });

        this.router.get('/staff.html', (req, res) => {
            res.redirect('/staff');
        });

        // 404 Handling
        this.router.use((req, res, next) => {
            res.status(404).sendFile(path.join(__dirname, '..', 'pages', 'error', '404.html'));
        });

        // Global error handling
        this.router.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Something went wrong!');
        });
    }
}

module.exports = new routes().router;
