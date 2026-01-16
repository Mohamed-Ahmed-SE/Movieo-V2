
import { mediaService } from './mediaService.js';
import dotenv from 'dotenv';
dotenv.config();

async function testManga() {
    console.log("Searching for 'One Piece' with type='manga'...");
    try {
        const results = await mediaService.search('One Piece', { type: 'manga' });
        console.log(`Found ${results.length} results.`);
        if (results.length > 0) {
            console.log("First result:", JSON.stringify(results[0], null, 2));
        }
    } catch (e) {
        console.error("Error searching manga:", e);
    }

    console.log("\nSearching for 'One Piece' with type=undefined (All)...");
    try {
        const results = await mediaService.search('One Piece', {});
        const manga = results.filter(r => r.type === 'manga');
        console.log(`Found ${results.length} total results, ${manga.length} are manga.`);
        if (manga.length > 0) {
            console.log("First manga result:", JSON.stringify(manga[0], null, 2));
        }
    } catch (e) {
        console.error("Error searching all:", e);
    }
}

testManga();
