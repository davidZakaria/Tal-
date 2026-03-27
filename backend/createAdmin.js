const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://localhost:27017/tale_hotel';

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const existingAdmin = await User.findOne({ email: 'admin@tale.com' });
        
        if (existingAdmin) {
            existingAdmin.role = 'Admin';
            existingAdmin.password = 'password123';
            await existingAdmin.save(); // Triggers the schema's pre-save bcrypt hash natively
            console.log('\n[TALÉ SECURE] Restored Master Admin Account Privileges!');
        } else {
            const admin = new User({
                email: 'admin@tale.com',
                password: 'password123',
                name: 'Talé Administrator',
                role: 'Admin'
            });
            await admin.save();
            console.log('\n[TALÉ SECURE] Fresh Master Admin Profile Assembled!');
        }
        
        console.log('\n--- TERMINAL KEYS ---');
        console.log('URI: http://localhost:3000/admin');
        console.log('Email: admin@tale.com');
        console.log('Passkey: password123\n');
        
        process.exit();
    } catch (err) {
        console.error("[CRITICAL DB FAILURE]", err);
        process.exit(1);
    }
};

seedAdmin();
