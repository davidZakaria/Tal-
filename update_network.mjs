import fs from 'fs';
import path from 'path';

const TARGET_IP = 'http://192.168.1.2:5000';

function replaceInDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.match(/\.(ts|tsx|js|jsx)$/)) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('http://localhost:5000')) {
                content = content.replace(/http:\/\/localhost:5000/g, TARGET_IP);
                fs.writeFileSync(fullPath, content);
                console.log(`[NETWORK SYNC] Mapped IPv4 payload inside -> ${fullPath}`);
            }
        }
    });
}

replaceInDir('./frontend/src');
console.log('✅ Global Frontend IP Routing Swapped Successfully!');
