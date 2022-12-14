// The colours from the wool combined with the number of bits that get cut of at that location
const woolData = {
    "white": {'bits': 0, 'colour': '#f2f5f3'},
    "orange": {'bits': 1, 'colour': '#ffcc75'},
    "magenta": {'bits': 2, 'colour': '#ff75fa'},
    "light-blue": {'bits': 3, 'colour': '#75fffd'},
    "yelllow": {'bits': 4, 'colour': '#fffd75'},
    "lime": {'bits': 5, 'colour': '#75ff7a'},
    "pink": {'bits': 6, 'colour': '#ff75a8'},
    "gray": {'bits': 7, 'colour': '#757575'},
    "light-gray": {'bits': 8, 'colour': '#a19f9f'},
    "cyan": {'bits': 9, 'colour': '#75ffc8'},
    "purple": {'bits': 10, 'colour': '#df75ff'},
    "blue": {'bits': 11, 'colour': '#7577ff'},
    "brown": {'bits': 12, 'colour': '#918474'},
};

const submittedBlockId = localStorage.getItem("id");
let submittedBlock = {
    "id": "0",
    "hexadecimal": "0x0000",
    "bits": "0000000000000",
    "longName": "minecraft:air",
    "details": [
        "no_details"
    ],
    "name": "air",
    "oldName": "air",
    "img": "https://minecraft-api.vercel.app/images/blocks/air.png"
};


fetch("public/data/blocklist.json").then((response) => response.json()).then(async (data) => {
    // Get the tabnav <ul>
    const tabnav = document.getElementById('tabnav');
    // Get the tabcontent <div>
    const tabcontent = document.getElementById('tabcontent');

    submittedBlock = data[submittedBlockId];

    for await (const wooltype of Object.keys(woolData)) {
        // Create a new tab <li> that looks like: <li class='tab active ' data-tab-target="#white">white</li>
        const tab = document.createElement('li');
            
        if (wooltype == 'white') { 
            tab.classList.add('active'); 
        }

        // Give the tab <li> properties
        tab.innerHTML = wooltype;
        tab.id = "#" + wooltype;
        tab.classList.add('tab');
        tab.dataset.tabTarget = "#" + wooltype;
        tab.style.color = woolData[wooltype]['colour'];
        tab.dataset.tabColour = woolData[wooltype]['colour'];

        // Add tab <li> to tabnav <ul>
        tabnav.appendChild(tab);
        // Add colour <div> to tabcontent <div>
        tabcontent.appendChild(blockResultsHolder(data, wooltype))
    }

    // Get all tabs with the tabTarget property
    const tabs = document.querySelectorAll('[data-tab-target]');
    // Tab logic
    tabs.forEach((tab) => {
        // Add an event listener to the tab <li>
        tab.addEventListener('click', () => {
            // Get all tab contents with the tabContent property
            const tabContents = document.querySelectorAll('[data-tab-content]');
            
            // tab.dataset.tabTarget is the id from the tab content <div>
            const target = document.querySelector(tab.dataset.tabTarget)
            // Give 'results' <div> the unique colour id and make all content childeren
            // Remove active class from all tabContents <div> and tabs <li>
            tabContents.forEach((content) => {
                content.classList.remove('active')
            })
            tabs.forEach((tab) => {
                tab.classList.remove('active')
                // Remove background color and set color
                tab.style.backgroundColor = '';
                tab.style.color = tab.dataset.tabColour;
            })

            // Make tab active
            tab.classList.add('active');
            target.classList.add('active');

            // Make the text black and set the backgroundcolor
            tab.style.color = 'black';
            tab.style.backgroundColor = tab.dataset.tabColour;
        })
    })

    const load = document.getElementById('load-wrap');
    load.style.display = "none";

    const contentWrap = document.getElementById('content-wrap');
    contentWrap.style.display = "";
})

// Get blocks that match requirements
function getBlocks(data, mode, bits) {
    // data: all blocks
    // mode: first/last (bits that need to match)
    // bits: number (where to split the 13 bits)

    let validBlocks = new Array();

    Object.keys(data).forEach((element) => {
        const block = data[element];

        // block.name == submittedBlock.name.toString() ||
        if ( block.name == "null") { return }
        
        if (mode == 'first') {
            if (bits == 0) { return validBlocks}
            if (block.bits.substring(0, bits) === submittedBlock.bits.substring(0, bits)) {
                // First bits from the block match
                validBlocks.push(block)
            } else { return }
        } else if (mode == 'last') {
            if (block.bits.substring(bits) === submittedBlock.bits.substring(bits)) {
                // Last bits from the block match
                validBlocks.push(block)
            } else { return }
        } else { return }  
    })

    return validBlocks

}

function addInfoHeader(wooltype) {
    // the spitted bits from the sumbitted block
    const bits = `<b>${submittedBlock.bits.substring(0,woolData[wooltype]['bits'])} ${submittedBlock.bits.substring(woolData[wooltype]['bits'])}</b>`

    // Create info <div> that will display extra information above the grid
    const info = document.createElement('div');

    info.innerHTML = `
    <a href="https://asinusgrandus.github.io/blockstearer/" onmouseover="this.style.cursor='pointer'" style="color: #0099ff; text-decoration: none;"><b><- Go back</b></a>
    <p>Selected block: (<b>${submittedBlock.id}) ${submittedBlock.name}</b><br>Bits: ${submittedBlock.bits}<br>Details: ${submittedBlock.details}</p>
    <p>The wordtearing needs to take place in the <a href="locations.html" style="text-decoration: none; color: #0099ff; "><b>location</b></a> from the ${wooltype} wool block at bit ${woolData[wooltype]['bits']}: ${bits}</p>
    <p>(The images used below might not represent the correct blockstate needed: please refer to the blockstate ids to know which one you need)</p>
    `;

    return info
}

function addColumnHolder(data, wooltype) {
    // Create new comulnHolder <div> that holds all result columns
    const columnHolder = document.createElement('div');
    columnHolder.classList.add('column_holder');

    const columns = ['first', 'last'];
    columns.forEach((name) => {
        columnHolder.appendChild(addColumn(data, wooltype, name));
    })
    return columnHolder
}

function addColumn(data, wooltype, name) {
    // Create new column <div>
    const blockColumn = document.createElement('div');
    // blockColumn.id = id;
    blockColumn.classList.add('block_column');
    blockColumn.style.borderColor = woolData[wooltype]['colour'];
    blockColumn.style.borderWidth = '5px';
    blockColumn.style.borderStyle = 'solid';
    
    // Add explanation <p> to blockColumn <div>
    blockColumn.appendChild(addExplanation(wooltype, name));
    blockColumn.appendChild(addGrid(data, wooltype, name));
    
    return blockColumn
}

function addGrid(data, wooltype, mode){
    // Create new grid <div> that will hold all blocks
    const grid = document.createElement('div');
    grid.id = mode + '_grid';
    grid.classList.add('grid')

    // Create all block elements
    let Used = new Array();
    // Get valid blocks
    const blocks = getBlocks(data, mode, woolData[wooltype]['bits']);

    blocks.forEach((block) => {
        if (Used.includes(block.name)) {
            // the block is already used
            // A <p> and <img> are combined into a <div> that has an array with details and the block it belongs to as dataset
            const detailsDiv = document.getElementById(block.name);

            if (detailsDiv == undefined || detailsDiv == null) { 
                // pass
            } else {
                const blockArray = JSON.parse(detailsDiv.dataset.details);
                blockArray.push(block);
                detailsDiv.dataset.details = JSON.stringify(blockArray);
            }

        } else {
            grid.appendChild(addBlock(block))
            Used.push(block.name)
        }
    })

    return grid
}

function addBlock(block) {
    // Create <div> element that will contain <p> and <img> 
    const blockdiv = document.createElement('div');
    blockdiv.id = block.name;
    blockdiv.classList.add('block')
    blockdiv.addEventListener("click", function(){ 
        popUp(block.name); 
    });
    // dataset.details holds blocks with the same name but different ids and details
    blockdiv.dataset.details = JSON.stringify([block]);
    // .dataset.block holds the block where the div belongs to
    blockdiv.dataset.block = JSON.stringify([block]);
    blockdiv.innerHTML = `
    <img src="${block.img}" width="50 height="50" onerror="this.onerror=null; this.src='https://static.wikia.nocookie.net/minecraft_gamepedia/images/b/b5/Missing_Texture_JE4.png';">
    <p>${block.oldName}</p>
    `;
 
    return blockdiv
}

function addExplanation(wooltype, name) {
    const firstBits = submittedBlock.bits.substring(0,woolData[wooltype]['bits']);
    const lastBits = submittedBlock.bits.substring(woolData[wooltype]['bits']);

    let bits = name == 'first' ? firstBits : lastBits;

    // Create new p <p> to explain the column
    const explanation = document.createElement('p');
    explanation.innerHTML = `All blocks with '<b>${bits}</b>' as <b>${name} bits</b>:`;
    explanation.style.padding = '5px';

    return explanation
}

function blockResultsHolder(data, wooltype) {
    // Create new results <div> that holds all result data
    const results = document.createElement('div');
    // Give the result <div> properties
    results.id = wooltype;
    results.dataset.tabContent = '';

    results.style.backgroundColor = '#282b30';

    if (wooltype == 'white') { 
        results.classList.add('active'); 
    }
    // Add info header <div> to result <div>
    results.appendChild(addInfoHeader(wooltype));
    results.appendChild(addColumnHolder(data, wooltype));
   
    return results
}


// Popups
function toggleModal() {
    const modal = document.querySelector(".modal");
    modal.classList.toggle("show-modal");
}

function popUp(id) {
    const closeButton = document.querySelector(".close-button");
    closeButton.addEventListener("click", toggleModal);

    const dataDiv = document.getElementById(id);
    const details = JSON.parse(dataDiv.dataset.details); // [{},{}]
    const block = JSON.parse(dataDiv.dataset.block)[0];

    // const imgImg = document.getElementById("blockimg");
    // imgImg.src = block.img;
    
    const nameH = document.getElementById('blockname');
    nameH.innerHTML = 'Name: ' + block.name;

    const bitsDiv = document.getElementById('bits');
    bitsDiv.innerHTML = 'Bits: ' + block.bits;

    const detailsText = document.getElementById('detailstext');
    let detailsDivText = "Details:<br>";
    detailsText.innerHTML = detailsDivText;

    const detailDiv = document.getElementById('details');
    detailDiv.style.height = "100px";
    detailDiv.style.overflowY = 'auto';
    
    let detaildetail = new String();

    details.forEach((block) => {
        let detailText = new String();
        block.details.forEach((detail) => {
            detailText += detail + ", ";
        })
        detaildetail += block.id + ': ' + detailText.slice(0, -2) + "<br>";
    })

    detailDiv.innerHTML = detaildetail;

    toggleModal()
}