
const catInput = document.getElementById('newCatName')
const catInputModal = document.getElementById('catName')

function validateCategory() {
  const newCatName = document.getElementById('newCatName').value.trim().toUpperCase();
  const errorMessageElement = document.getElementById('error-message');

  console.log('newCatName:', newCatName);

  if (newCatName.length === 0) {
      errorMessageElement.textContent = 'Category name is required';
      return false;
  }

  // Assuming you have an array of existing category names called 'existingCategories'
  const existingCategories = ['Category1', 'Category2', 'Category3']; // Replace with your actual existing categories

  if (existingCategories.includes(newCatName)) {
      errorMessageElement.textContent = 'Category already exists';
      return false;
  }

  errorMessageElement.textContent = ''; 
  return true;
}

function validateModalCategory(){

const newName = document.getElementById('catName').value.trim().toUpperCase()

if(newName.length === 0){
  catInputModal.placeholder = 'Category required'
  catInputModal.style.borderColor = 'red'
  catInputModal.style.textDecorationColor = 'red' 
  return false;
}

return true
}
