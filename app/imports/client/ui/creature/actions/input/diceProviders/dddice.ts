import {ThreeDDice, ThreeDDiceAPI, ThreeDDiceRollEvent, IDiceRoll} from 'dddice-js';

let dddice;
const RENDER_MODE = 'on';
const APP_NAME = 'Dice Cloud'
const theme = 'dddice-bees';
const room ='4qR_jcc';

async function createGuestUserIfNeeded() {
    let apiKey = window.localStorage.getItem('dddice.apiKey') as string;
    if (!apiKey) {
        console.log('creating guest account');
        apiKey = (await new ThreeDDiceAPI(undefined, APP_NAME).user.guest()).data;
        await window.localStorage.setItem('dddice.apiKey', apiKey);

    }
    return apiKey;
}

const waitForRoll = () =>
{
    return new Promise(resolve => {
        dddice.off(ThreeDDiceRollEvent.RollFinished);
        dddice.on(ThreeDDiceRollEvent.RollFinished, () => resolve());
    });
}

const rollDice = async (
    dice: { number: number, diceSize: number }[]
): Promise<number[][]> => {

    const diceToRoll: IDiceRoll[] = [];
    dice.forEach(die =>{
        for(let i = 0; i < die.number; i++){
            diceToRoll.push({type:'d'+die.diceSize,theme})
        }
    })

    const roll = await dddice.api.roll.create(diceToRoll,{
        room: room,
    });
    await waitForRoll();
    console.log(roll.data.values.map(value=>value.value_to_display));
    return [roll.data.values.map(value=>value.value_to_display)];
};


async function setUpDddiceSdk() {
    console.log('setting up dddice sdk');
    const apiKey = await createGuestUserIfNeeded();
    if (apiKey && room && !dddice) {
        try {
            api = new ThreeDDiceAPI(apiKey, 'Dice Cloud');
            const user: IUser = (await api.user.get()).data;

            let canvas: HTMLCanvasElement = document.getElementById('dddice-canvas') as HTMLCanvasElement;

            if (dddice) {
                // clear the board
                if (canvas) {
                    canvas.remove();
                    canvas = undefined;
                }
                // disconnect from echo
                if (dddice.api?.connection) dddice.api.connection.disconnect();
                // stop the animation loop
                dddice.stop();
            }

            if (RENDER_MODE === 'on') {
                console.log('render mode is on');
                if (!canvas) {
                    // add canvas element to document
                    canvas = document.createElement('canvas');
                    canvas.id = 'dddice-canvas';
                    // if the css fails to load for any reason, using tailwinds classes here
                    // will disable the whole interface
                    canvas.style.top = '0px';
                    canvas.style.position = 'fixed';
                    canvas.style.pointerEvents = 'none';
                    canvas.style.zIndex = '100000';
                    canvas.style.opacity = '100';
                    canvas.style.height = '100vh';
                    canvas.style.width = '100vw';
                    document.body.appendChild(canvas);
                    window.addEventListener(
                        'resize',
                        () => dddice && dddice.renderer && dddice.resize(window.innerWidth, window.innerHeight),
                    );
                }
                dddice = new ThreeDDice().initialize(canvas, apiKey, undefined, APP_NAME);
                dddice.start();
                try {
                    dddice.api.room.join(room);
                } catch (error) {
                    log.warn('eating error', error.response?.data?.data?.message);
                }
                dddice.connect(room, undefined, user.uuid);
                //dddice.on(ThreeDDiceRollEvent.RollCreated, (roll: IRoll) => rollCreated(roll));
                dddice.off(ThreeDDiceRollEvent.RollFinished);
                dddice.on(ThreeDDiceRollEvent.RollFinished, (roll: IRoll) => rollFinished(roll));
            } else {
                console.log('render mode is off');
                dddice = new ThreeDDice();
                dddice.api = new ThreeDDiceAPI(apiKey, APP_NAME);
                try {
                    dddice.api.room.join(room);
                } catch (error) {
                    log.warn('eating error', error.response?.data?.data?.message);
                }
                dddice.api.connect(room, undefined, user.uuid);
                //dddice.api.listen(ThreeDDiceRollEvent.RollCreated, (roll: IRoll) => rollCreated(roll));
            }


            console.log('dddice is ready to roll!');
        } catch (e) {
            console.error(e);
            console.error(`dddice | ${e.response?.data?.data?.message ?? e}`);
            return;
        }
    }
    if (dddice) {
        document.body.addEventListener('click', () => {
            if (dddice && !dddice?.isDiceThrowing) {
                dddice.clear();
            }
        });
    }
}

export {setUpDddiceSdk, rollDice};