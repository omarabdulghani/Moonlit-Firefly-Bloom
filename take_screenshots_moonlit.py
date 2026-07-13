import asyncio
from playwright.async_api import async_playwright
import subprocess
import time
import os
import shutil

async def take_screenshots():
    # Start the dev server
    print("Starting Vite server...")
    # Use shell=True for npm commands on Windows to ensure it finds the npm executable
    server = subprocess.Popen("npm run dev", shell=True)
    time.sleep(5) # Wait for vite to bundle and start

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(viewport={'width': 1280, 'height': 720})
            print("Navigating to Moonlit Firefly Bloom...")
            await page.goto("http://localhost:5173/")
            
            # Wait for canvas to render the start screen
            await page.wait_for_timeout(2000)
            
            project_root = os.path.dirname(os.path.abspath(__file__))
            output_dir = os.path.normpath(os.path.join(project_root, "..", "My Portfolio", "omar-portfolio", "client", "public", "client", "public", "images", "moonlit-gallery"))
            os.makedirs(output_dir, exist_ok=True)
            
            print("Taking hero screenshot...")
            await page.screenshot(path=os.path.join(output_dir, "hero.png"))
            
            print("Taking thumbnail screenshot...")
            await page.screenshot(path=os.path.join(output_dir, "thumbnail.png"), clip={'x': 200, 'y': 100, 'width': 800, 'height': 600})
            
            print("Taking logo screenshots (small crop)...")
            await page.screenshot(path=os.path.join(output_dir, "logo-light.png"), clip={'x': 600, 'y': 300, 'width': 100, 'height': 100})
            shutil.copy(os.path.join(output_dir, "logo-light.png"), os.path.join(output_dir, "logo-dark.png"))

            print("Starting game to take gameplay screenshot...")
            # Click canvas to start
            await page.mouse.click(640, 360)
            await page.wait_for_timeout(3000) # Play for 3 seconds
            await page.screenshot(path=os.path.join(output_dir, "gameplay.png"))
            
            print("Navigating to Full Moon Sequence test...")
            await page.goto("http://localhost:5173/?devFullMoonSequence=1")
            await page.wait_for_timeout(1000)
            await page.mouse.click(640, 360) # Start run
            await page.wait_for_timeout(4000) # Wait for sequence to look cool
            await page.screenshot(path=os.path.join(output_dir, "celestial.png"))
            
            await browser.close()
            print("Screenshots captured successfully!")
    finally:
        # Kill the vite server gracefully or forcefully on Windows
        subprocess.call(['taskkill', '/F', '/T', '/PID', str(server.pid)])

if __name__ == "__main__":
    asyncio.run(take_screenshots())
