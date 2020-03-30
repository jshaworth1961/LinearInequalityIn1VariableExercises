/*
This program was written by John S. Haworth. The idea came from code by John Larson 4.10.2017 Part 3 Web Dev Zone. This program provides the students with randomly generated linear inequalities in two variables. It provides them with a shaded graph going through 2 points. In most cases the student will have to use the points to determine the boundary of the inequality which will be the line (y = mx + b).
The student will then have to take test points to determine which half-plane to shade. After a period of 3 minutes the correct solution is available on the left calculator.
*/


let graphCalc = undefined;
let graphCalc2 = undefined;
let pointsCollection = undefined;
let qIndex = undefined;


function start() {
    let elt = document.getElementById('calculator')

    graphCalc = Desmos.GraphingCalculator(elt,
        {
            expressionsCollapsed: true
        });

    graphCalc.updateSettings(
        {
            showGrid: true,
            projectorMode: true,
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            expressions: false

        });

    qIndex = -1;
    pointsCollection = [];

    let elt2 = document.getElementById('calculator2')

    graphCalc2 = Desmos.GraphingCalculator(elt2,
        {
            expressionsCollapsed: true
        });

    graphCalc2.updateSettings(
        {
            showGrid: true,
            projectorMode: true,
            xAxisLabel: 'x',
            yAxisLabel: 'y'

        });

    document.getElementById('btn-start').hidden = true;

}



function between(a, b) {
    let range = b - a + 1;
    return a + Math.floor(Math.random() * range);
}

function getPoints() {
    let p1 = { x: 0, y: 0 };
    let p2 = { x: 0, y: 0 };

    while (p1.x === p2.x && p1.y === p2.y) {
        p1.x = between(-5, 5);
        p1.y = between(-5, 5);
        p2.x = between(-5, 5);
        p2.y = between(-5, 5);
    }

    return [p1, p2];
}

function getFractionString(num, den, cb) {
    let helper = graphCalc.HelperExpression(
        {
            latex: '\\gcd(' + num + ',' + den + ')'

        });

    helper.observe('numericValue', function () {
        let fracString = num * den < 0 ? '-' : '';

        num = Math.abs(num / helper.numericValue);
        den = Math.abs(den / helper.numericValue);

        if (den === 1) {
            fracString += num;
        }
        else {
            fracString += '\\frac{' + num + '}{' + den + '}';
        }

        cb(fracString);

    });


}

function getGradientInfo(points) {
    let deltaY = points[1].y - points[0].y;
    let deltaX = points[1].x - points[0].x;

    return {
        dy: deltaY,
        dx: deltaX,
        isZero: deltaY === 0 && deltaX !== 0,
        isUndefined: deltaX === 0,
        yIntNum: points[0].y * deltaX - points[0].x * deltaY
    }
}

function getInequalitySign() {

    let result = Math.floor(1 + 4 * Math.random());
    console.log(result);

    switch (true) {
        case (result === 1):
            {
                inequalitySign = '<';
                break;
            }
        case (result === 2):
            {
                inequalitySign = '<=';
                break;
            }
        case (result === 3):
            {
                inequalitySign = '>';
                break;
            }
        case (result === 4):
            {
                inequalitySign = '>=';
                break;
            }


    }

    console.log(inequalitySign);
    return inequalitySign;

}

function pointString(point) {
    return `(${point.x},${point.y})`;
}

function lineString(points, cb) {

    let info = getGradientInfo(points);

    let inequalSign = getInequalitySign()
    console.log(inequalSign);

    if (info.isUndefined) {
        cb('x ' + inequalSign + ' ' + points[0].x);

    }
    else if (info.isZero) {
        cb('y ' + inequalSign + ' ' + points[0].y);
    }
    else {
        getFractionString(info.dy, info.dx, function (gradient) {
            getFractionString(info.yIntNum, info.dx, function (yInt) {
                let lineString = 'y  ' + inequalSign + ' ' + gradient + 'x + ' + yInt;


                lineString = lineString
                    .replace(' 1x', 'x')
                    .replace('-1x', '-x')
                    .replace(' + -', ' - ')
                    .replace(' + 0', '');



                cb(lineString);
            });
        });
    }



}

function showLine() {

    let points = pointsCollection[qIndex];

    graphCalc.setMathBounds({
        left: -8,
        right: 8,
        bottom: Math.min(points[0].y, points[1].y) - 5,
        top: Math.max(points[0].y, points[1].y) + 5
    });

    lineString(points, function (line) {

        graphCalc.setExpression({ id: 'line', latex: line });

        //console.log(graphCalc.getExpressions()[2].latex);




    });

    points.forEach(function (point, i) {
        graphCalc.setExpression({ id: 'point' + i, latex: pointString(point), color: Desmos.Colors.RED });
    });

}

function setTitle() {
    let title = 'Single Linear Inequality in Two Variables: Problem ';
    let desmosTitle = document.getElementById('desmosTitle');

    if (pointsCollection.length) {
        title += (qIndex + 1) + ' of ' + pointsCollection.length;
    }
    else {
        title += 'click Next to create a new linear inequality';
    }

    desmosTitle.innerText = title;
}

function render() {
    showLine();
    setTitle();
}

function showAnswer() {

    graphCalc.updateSettings(
        {
            showGrid: true,
            projectorMode: true,
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            expressions: true

        });

    clearTimeout(showAnswer);


};


function next() {

    graphCalc.updateSettings(
        {
            showGrid: true,
            projectorMode: true,
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            expressions: false

        });



    if (qIndex === pointsCollection.length - 1) {
        pointsCollection.push(getPoints());
    }

    qIndex++;
    render();

}

function prev() {
    if (qIndex > 0) {
        qIndex--;
        render();
    }
}

function first() {
    if (pointsCollection.length) {
        qIndex = 0;
        render();
    }
}

function last() {
    if (pointsCollection.length) {
        qIndex = pointsCollection.length - 1;
        render();
    }
}

function clearLines() {
    qIndex = -1;
    pointsCollection = [];
    setTitle();


    graphCalc.removeExpressions(
        [
            { id: 'point0' },
            { id: 'point1' },
            { id: 'line' }
        ]);


}

function compareAnswers() {

    let correctSolution = graphCalc.getExpressions()[2].latex;
    correctSolution.replace(' ', '');
    correctSolution.replace('\\', '');



    let yourSolution = graphCalc2.getExpressions()[2].latex;


    console.log(`correctSolution is ${correctSolution}`);
    console.log(`yourSolution is ${yourSolution}`);


    if (yourSolution == correctSolution) {
        alert("YOU ARE CORRECT!!!");
    }


}








