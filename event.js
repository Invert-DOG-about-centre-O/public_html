// Copyright 2025 Tom Fryers
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License
function maxBy(a, f) {
    return a.reduce((x, y) => (f(y) > f(x) ? y : x));
}
function parseDateTime(datetime) {
    let words = datetime
        .toLowerCase()
        .split(/[- –,;]/)
        .filter((x) => x);
    while (!Number(words[0][0])) {
        words.shift();
    }
    const day = Number(/\d+/.exec(words[0]));
    words.shift();
    const month = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
    ].findIndex((m) => words[0].includes(m));
    words.shift();
    const year = Number(/\d+/.exec(words[0]));
    words.shift();
    const time = maxBy(
        words,
        (x) => x.includes("pm") + x.includes("am") + x.includes(":"),
    );
    const [hour, minute] = parseTime(time);
    return new Date(year, month, day, hour, minute);
}
function parseTime(time) {
    const [hoursString, minutesString, ..._] = time.split(":");
    let hours = Number(/\d+/.exec(hoursString)[0]);
    let minutes = Number(/\d+/.exec(minutesString)[0]);
    if (time.includes("p")) {
        hours += 12;
    }
    return [hours, minutes];
}
function reverseUpcomingToTop(doc) {
    const now = Date.now();
    events = doc.getElementById("events");
    events.removeChild(doc.getElementById("events-title"));
    let firstOlder = [...events.children].findIndex((x) => {
        if (x.nodeName !== "B") {
            return false;
        }
        let thisTime;
        try {
            thisTime = parseDateTime(x.innerHTML);
        } catch (e) {
            return false;
        }
        return parseDateTime(x.innerHTML) < now;
    });
    let blocks = [[]];
    for (let i = 0; i < firstOlder; i++) {
        const child = events.removeChild(events.children[0]);
        if (child.nodeName === "HR") {
            blocks.push([]);
        } else {
            blocks[blocks.length - 1].push(child);
        }
    }
    for (const a of blocks.pop().reverse()) {
        events.insertBefore(a, events.children[0]);
    }
    {
        const text = document.createTextNode("Past Events:");
        const heading = document.createElement("h1");
        heading.appendChild(text);
        events.insertBefore(heading, events.children[0]);
    }
    for (const block of blocks) {
        events.insertBefore(document.createElement("hr"), events.children[0]);
        for (const a of block.reverse()) {
            events.insertBefore(a, events.children[0]);
        }
    }
    {
        const text = document.createTextNode("Upcoming Events:");
        const heading = document.createElement("h1");
        heading.appendChild(text);
        events.insertBefore(heading, events.children[0]);
    }
    return [blocks?.[blocks.length - 1], blocks?.[blocks.length - 2]].filter(
        (b) => b !== undefined,
    );
}
{
    const events = document.getElementById("events");
    if (events !== null) {
        reverseUpcomingToTop(document);
    }
}
{
    const homeEvents = document.getElementById("home-events");
    if (homeEvents !== null) {
        const template = document.createElement("template");
        fetch("/events").then((response) =>
            response.text().then((text) => {
                template.innerHTML = text;
                let nextTwo = reverseUpcomingToTop(template.content);
                const seeRest = document.getElementById("see-rest");
                for (const block of nextTwo) {
                    for (const a of block.reverse()) {
                        homeEvents.insertBefore(a, seeRest);
                    }
                    homeEvents.insertBefore(
                        document.createElement("hr"),
                        seeRest,
                    );
                }
            }),
        );
    }
}
