# Expected Logic for the Script

The script should be able to do the following:
- Do dungeons with corresponding quests
- Do expeditions
- Save gold and buy items from the market

## Dungeon Logic
Goal: Only do dungeons when all 3 types of quests are active and stop when they are not.
- Check if all 3 types of quests are active and
    - if not, turn off the doDungeon option
    - if yes, turn on the doDungeon option
- The check has to be done every time the script finishes a dungeon

## Expedition Logic
Goal: Do expeditions until the player runs out of health or the gold can be saved.
The health should remain above 40% at all times.
To save gold, the player has to have 104000 gold: 100000 to buy the item and 4000 to resell the item.

## Saving Gold Logic
Goal: Save gold to buy items from the market and resell them on the same price.
Steps:
- Check if the player has 104000 gold
- If yes, navigate to the market
- Buy an item worth 100000 gold
- Go to the Packages tab
- Retrive the item
- Go to the market
- Sell the item for 100000 gold
