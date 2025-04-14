// Updated JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const colorInfoBtn = document.getElementById('colorInfoBtn');
    const infoBox = document.getElementById('colorInfo');

    colorInfoBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        infoBox.classList.toggle('active');
    });

    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        if (!infoBox.contains(e.target) && e.target !== colorInfoBtn) {
            infoBox.classList.remove('active');
        }
    });
});

document.getElementById('gearBtn').addEventListener('click', () => {
    const gearBtn = document.getElementById('gearBtn');
    const calc = document.getElementById('beltCalculator');

    gearBtn.classList.add('spin');
    setTimeout(() => gearBtn.classList.remove('spin'), 500); // remove after animation

    calc.classList.toggle('hidden');
});


document.getElementById('closeCalc').addEventListener('click', () => {
    document.getElementById('beltCalculator').classList.add('hidden');
});

function calculateBelt() {
    const teeth1 = parseInt(document.getElementById('teeth1').value);
    const teeth2 = parseInt(document.getElementById('teeth2').value);
    const distance = parseFloat(document.getElementById('distance').value);

    if (!teeth1 || !teeth2 || !distance) {
        document.getElementById('beltResult').innerText = "Please fill all fields.";
        return;
    }

    const pitch = 0.2; // 5mm HTD pitch in inches
    const beltLengthIn = (2 * distance) + ((teeth1 + teeth2) / 2 * pitch) + ((Math.pow(teeth2 - teeth1, 2)) / (4 * Math.PI * distance)) * pitch;

    const roundedTeeth = Math.round(beltLengthIn / pitch);
    const actualLengthIn = roundedTeeth * pitch;
    const actualLengthMm = actualLengthIn * 25.4;

    document.getElementById('beltResult').innerText = 
        `Estimated Belt: ${roundedTeeth} teeth\n` +
        `Length: ${actualLengthIn.toFixed(2)} in / ${actualLengthMm.toFixed(1)} mm`;
}

document.getElementById('formatForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const modelType = document.getElementById('modelType').value;
    const partsName = document.getElementById('partsName').value;
    const plate = document.getElementById('plate').value;
    const motor = document.getElementById('motor').value;
    const width = document.getElementById('width').value;
    const manufactureMethod = document.getElementById('manufactureMethod').value;
    const modelOrder = modelType === 'Main_Assembly' ? '' : document.getElementById('modelOrder').value;
    const modelVersion = document.getElementById('modelVersion').value;
    const systemType = document.getElementById('type').value;

    if (modelType === 'Part') {

        if (partsName === 'MOTOR' && !motor) {
            alert("You didn't choose Motor.");
            return;
        }

        if (partsName === 'PLATE' && !plate) {
            alert("You didn't choose Plate.");
            return;
        }

        if (plate === 'Aluminium' && (!width || width <= 0)) {
            alert("You must provide a valid width for Aluminium plate.");
            return;
        }
    }

    const formatId = generateFormatId(
        systemType, modelType, modelOrder, modelVersion, partsName, motor, plate, width, manufactureMethod
    );

    const resultElement = document.getElementById('result');
    resultElement.innerText = formatId;

    navigator.clipboard.writeText(formatId)
        .catch(err => {
            console.error("Failed to copy format ID: ", err);
            alert("Failed to copy format ID. Please try manually copying it.");
        });
});

function generateFormatId(systemType, modelType, modelOrder, modelVersion, partsName, motor, plate, width, manufactureMethod) {
    const space = "-";
    const cadId = generateCadId(systemType, modelType, modelOrder, modelVersion, partsName);

    let formatParts = [];
    let manufacture = '';

    if (modelType !== 'Main_Assembly') {
        if (modelType !== 'Sub_Assembly') {
            if (partsName === 'PLATE') {
                if (plate === 'Aluminium' && width > 0) {
                    formatParts.push(`${partsName}${width}`);
                } else if (plate !== 'Aluminium') {
                    formatParts.push(`${partsName}${space}${plate}`);
                }
            } else if (partsName === 'MOTOR' && motor) {
                formatParts.push(`${motor}`);
            } else if (partsName) {
                formatParts.push(partsName);
            }
        }

        if (modelType !== 'Sub_Assembly' && partsName) {
            manufacture = manufactureMethod;
        }
    }

    return cadId + (formatParts.length > 0 ? space + formatParts.join(space) : '') + (manufacture ? space + manufacture : '');
}

function generateCadId(systemType, modelType, modelOrder, modelVersion) {
    const year = new Date().getFullYear();
    let cadId = year + "-" + systemType + "-";

    if (modelType === 'Sub_Assembly') {
        cadId += `${modelOrder}0${modelVersion}`;
    } else {
        cadId += formatModelOrder(modelOrder);
        cadId += modelVersion;
    }

    return cadId;
}

function formatModelOrder(modelOrder) {
    return modelOrder.padStart(2, '0');
}

document.getElementById('modelType').addEventListener('change', updateFieldVisibility);
document.getElementById('partsName').addEventListener('change', updateFieldVisibility);
document.getElementById('plate').addEventListener('change', updateFieldVisibility);

document.addEventListener('DOMContentLoaded', updateFieldVisibility);

function updateFieldVisibility() {
    const modelType = document.getElementById('modelType').value;
    const partsName = document.getElementById('partsName').value;
    const plate = document.getElementById('plate').value;

    const modelOrderField = document.getElementById('modelOrder').parentElement;
    modelOrderField.style.display = modelType === 'Main_Assembly' ? 'none' : 'block';

    document.getElementById('partsName').parentElement.style.display = modelType === 'Main_Assembly' || modelType === 'Sub_Assembly' ? 'none' : 'block';

    document.getElementById('plate').parentElement.style.display = partsName === 'PLATE' ? 'block' : 'none';

    document.getElementById('motor').parentElement.style.display = partsName === 'MOTOR' && modelType === 'Part' ? 'block' : 'none';

    document.getElementById('width').parentElement.style.display = modelType === 'Part' && partsName === 'PLATE' && plate === 'Aluminium' ? 'block' : 'none';

    document.getElementById('manufactureMethod').parentElement.style.display = modelType === 'Main_Assembly' || modelType === 'Sub_Assembly' || !partsName ? 'none' : 'block';
}
