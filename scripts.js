async function search(term) {
  const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1.1/search?q=${term}`;
  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error.message);
  }
}

async function nextImage() {
  const index = searchResult.objectIDs.indexOf(currentImageId) + 1;
  for (const id of searchResult.objectIDs.slice(index, index + 10)) {
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const objectResult = await response.json();
      if (!objectResult.primaryImageSmall) {
        continue;
      }
      currentImageId = id;
      const container = document.getElementById("container");
      container.innerHTML = `
              <h1>${objectResult.artistDisplayName || "Artist Unknown"} - ${objectResult.title} (${objectResult.objectBeginDate})</h1>
              <div><button id="next-button" onclick="nextImage()">Next Image</button></div>
              <img src="${objectResult.primaryImageSmall}"></img>
              <p><b>Description/Materials: </b>${objectResult.medium}</p>
              <p><b>Location/Department: </b>${objectResult.department}</p>
            `;
      return;
    } catch (error) {
      console.error(error.message);
    }
  }
  console.log("next-button");
  const nextButton = document.getElementById("next-button");
  nextButton.disabled = true;
}

let searchResult;
let currentImageId = 0;
const form = document.getElementById("search-form");
const submitBtn = document.getElementById("submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  searchResult = await search(data.get("search"));
  let imageFound = false;
  submitBtn.disabled = true;
  submitBtn.value = "Loading...";
  for (const id of searchResult.objectIDs.slice(0, 10)) {
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const objectResult = await response.json();
      if (!objectResult.primaryImageSmall) {
        continue;
      }
      currentImageId = id;
      const container = document.getElementById("container");
      container.innerHTML = `
              <h1>${objectResult.artistDisplayName || "Artist Unknown"} - ${objectResult.title} (${objectResult.objectBeginDate})</h1>
              <div><button id="next-button" onclick="nextImage()">Next Image</button></div>
              <img src="${objectResult.primaryImageSmall}"></img>
              <p><b>Description/Materials: </b>${objectResult.medium}</p>
              <p><b>Location/Department: </b>${objectResult.department}</p>
            `;
      imageFound = true;
      break;
    } catch (error) {
      console.error(error.message);
    }
  }
  submitBtn.disabled = false;
  submitBtn.value = "Submit";
  if (!imageFound) {
    const container = document.getElementById("container");
    container.innerHTML = `<h2>Sorry, try a different search!</h2>`;
  }
});
