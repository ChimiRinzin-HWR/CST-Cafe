// Contentful API credentials
const spaceId = 'd000iobkmws6';
const accessToken = 'bMDA95aDt9rAJaZI0vYD0BuEmaTzNabaCA76XjbKMEI';
const contentType = 'cstCafe';

const apiKey = 'AIzaSyBbBzy77U3B4E9OlUnawwNopP7WjodHJlE'; // Replace with your API key
const spreadsheetId = '1PWnEgMbCHJ7nh3A1DOy-AsAziuqa71lnQDIdwFteXwM'; // Replace with your spreadsheet ID
const range = 'Sheet1!A2:B'; // Adjust the range as needed

const dictionary = {};

async function fetchData() {
  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if the data has values
    if (data.values && data.values.length) {

        // Iterate through rows to create a dictionary
        data.values.forEach(row => {
            const menuName = row[0]; // First column as key
            const availability = row[1]; // Second column as value
            dictionary[menuName] = availability === 'TRUE'; // Convert availability to boolean
        });
    } else {
        console.log('No data found in the specified range.');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


// Function to fetch data from Contentful
async function fetchMenuItems() {
  const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/master/entries?access_token=${accessToken}&content_type=${contentType}&include=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

// Function to render the menu in HTML
function renderMenu(menuItems, assets) {
    for(i = 0; i < 8; i++){
      menuItems.forEach((item) => {
        const { menuName, price, category, menuDescription } = item.fields;
        const imageId = item.fields.image.sys.id;
        // Find the corresponding image URL
        const imageUrl = assets.find(asset => asset.sys.id === imageId)?.fields.file.url || '';
        console.log(dictionary)
        if(dictionary[menuName]){
          // Create a section for each category
          const section = document.getElementById(`${category.toLowerCase()}`);
          const div1 = document.createElement("div");
          div1.classList.add("menu-item");

          const img = document.createElement("img");
          img.setAttribute("src", `${imageUrl}`);
          img.setAttribute("alt", `A photo of ${menuName}`);

          const div2 = document.createElement("div");
          div2.classList.add("name-div");

          const plusDiv = document.createElement("div");
          plusDiv.classList.add("plusDiv");
          const minusDiv = document.createElement("div");
          minusDiv.classList.add("minusDiv");

          plusDiv.innerHTML = `
              <svg class="plus" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>
          `
          minusDiv.innerHTML = `
              <svg class="minus" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0V.375Z"/></svg>
          `

          const h3 = document.createElement("h3");
          h3.textContent = menuName;


          div2.appendChild(plusDiv);
          div2.appendChild(minusDiv);
          div2.appendChild(h3);

          const p1 = document.createElement("p");
          p1.classList.add("descriptions");
          p1.textContent = menuDescription;

          const p2 = document.createElement("p");
          p2.classList.add("price");
          p2.innerHTML = `<span>Price: </span><strong>Nu. </strong>${price}`

          div1.appendChild(img);
          div1.appendChild(div2);
          div1.appendChild(p1);
          div1.appendChild(p2);

          section.appendChild(div1);

          plusDiv.addEventListener("click", function(){
              p1.classList.add("descriptions-clicked");
              plusDiv.style.display = "none";
              minusDiv.style.display = "block";
          })
          minusDiv.addEventListener("click", function(){
              p1.classList.remove("descriptions-clicked");
              plusDiv.style.display = "block";
              minusDiv.style.display = "none";
          })
        }
    });
  }
}

// Initialize the page
async function init() {
  await fetchData();
  const data = await fetchMenuItems();

  if (data) {
    const items = data.items;
    const assets = data.includes.Asset;
    // Call the fetchData function to get data from Google Sheets
    renderMenu(items, assets);
  } else {
    console.error('No data to display');
  }
}

// Call the init function when the page loads
document.addEventListener('DOMContentLoaded', init);
