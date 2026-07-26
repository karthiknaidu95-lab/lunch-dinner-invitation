const WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
const state = {
    selectedMeal: null,
    isSubmitting: false,
    validationErrors: {}
};

const elements = {
    dateInput: document.getElementById('dateInput'),
    timeInput: document.getElementById('timeInput'),
    mealInput: document.getElementById('mealInput'),
    mealCards: document.querySelectorAll('.meal-card'),
    yesBtn: document.getElementById('yesBtn'),
    noBtn: document.getElementById('noBtn'),
    dateError: document.getElementById('dateError'),
    timeError: document.getElementById('timeError'),
    mealError: document.getElementById('mealError'),
    successPopup: document.getElementById('successPopup'),
    errorPopup: document.getElementById('errorPopup'),
    popupMessage: document.getElementById('popupMessage'),
    popupIcon: document.getElementById('popupIcon'),
    popupBtn: document.getElementById('popupBtn'),
    errorMessage: document.getElementById('errorMessage'),
    errorBtn: document.getElementById('errorBtn'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    extraActions: document.getElementById('extraActions'),
    calendarBtn: document.getElementById('calendarBtn'),
    mapsBtn: document.getElementById('mapsBtn')
};

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    setMinDate();
});

function initializeEventListeners() {
    elements.mealCards.forEach(card => {
        card.addEventListener('click', handleMealSelection);
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMealSelection.call(this);
            }
        });
    });
    elements.yesBtn.addEventListener('click', () => handleResponse('yes'));
    elements.noBtn.addEventListener('click', () => handleResponse('no'));
    elements.calendarBtn.addEventListener('click', handleAddToCalendar);
    elements.mapsBtn.addEventListener('click', handleViewLocation);
    elements.popupBtn.addEventListener('click', handlePopupClose);
    elements.errorBtn.addEventListener('click', handleErrorClose);
    elements.dateInput.addEventListener('change', validateDate);
    elements.timeInput.addEventListener('change', validateTime);
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    elements.dateInput.setAttribute('min', today);
}

function handleMealSelection(event) {
    const card = event.currentTarget;
    const meal = card.getAttribute('data-meal');
    elements.mealCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.selectedMeal = meal;
    elements.mealInput.value = meal;
    clearError('meal');
}

function validateDate() {
    const date = elements.dateInput.value;
    if (!date) {
        showError('date', 'Please select a date');
        return false;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        showError('date', 'Please select a future date');
        return false;
    }
    clearError('date');
    return true;
}

function validateTime() {
    const time = elements.timeInput.value;
    if (!time) {
        showError('time', 'Please select a time');
        return false;
    }
    clearError('time');
    return true;
}

function validateMeal() {
    if (!state.selectedMeal) {
        showError('meal', 'Please select lunch or dinner');
        return false;
    }
    clearError('meal');
    return true;
}

function validateForm() {
    const dateValid = validateDate();
    const timeValid = validateTime();
    const mealValid = validateMeal();
    return dateValid && timeValid && mealValid;
}

function showError(field, message) {
    const errorElement = elements[field + 'Error'];
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        state.validationErrors[field] = message;
    }
}

function clearError(field) {
    const errorElement = elements[field + 'Error'];
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        delete state.validationErrors[field];
    }
}

async function handleResponse(response) {
    if (!validateForm()) return;
    if (state.isSubmitting) return;
    
    const date = elements.dateInput.value;
    const time = elements.timeInput.value;
    const meal = elements.mealInput.value;
    
    state.isSubmitting = true;
    elements.yesBtn.disabled = true;
    elements.noBtn.disabled = true;
    elements.loadingSpinner.style.display = 'flex';
    
    try {
        const { device, browser } = window.getDeviceInfo();
        const submittedOn = new Date().toISOString();
        const payload = { response, date, time, meal, browser, device, submittedOn };
        const success = await sendToGoogleAppsScript(payload);
        
        if (success) {
            elements.loadingSpinner.style.display = 'none';
            if (response === 'yes') {
                handleYesResponse();
            } else {
                handleNoResponse();
            }
        } else {
            throw new Error('Failed to submit response');
        }
    } catch (error) {
        console.error('Error:', error);
        elements.loadingSpinner.style.display = 'none';
        showErrorPopup('Failed to submit your response. Please try again.');
        elements.yesBtn.disabled = false;
        elements.noBtn.disabled = false;
        state.isSubmitting = false;
    }
}

function handleYesResponse() {
    window.showCelebration();
    elements.popupIcon.textContent = '🎉';
    elements.popupMessage.textContent = 'Awesome! Looking forward to meeting you 😊';
    showPopup('success');
    setTimeout(() => {
        elements.extraActions.style.display = 'flex';
    }, 800);
}

function handleNoResponse() {
    window.showNoAnimation();
    elements.popupIcon.textContent = '😊';
    elements.popupMessage.textContent = 'Thanks for letting me know 😊';
    showPopup('success');
}

async function sendToGoogleAppsScript(payload) {
    try {
        if (WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
            console.warn('Google Apps Script URL not configured. Demo mode.');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return true;
        }
        await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return true;
    } catch (error) {
        console.error('API Error:', error);
        return false;
    }
}

function handleAddToCalendar() {
    const date = elements.dateInput.value;
    const time = elements.timeInput.value;
    const meal = elements.mealInput.value;
    const title = `${meal.charAt(0).toUpperCase() + meal.slice(1)} Meeting`;
    const url = window.generateGoogleCalendarUrl(date, time, title, 'Meeting for lunch or dinner');
    if (url) window.open(url, '_blank');
}

function handleViewLocation() {
    const latitude = 40.7128;
    const longitude = -74.0060;
    window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
}

function showPopup(type) {
    closePopups();
    if (type === 'success') {
        elements.successPopup.classList.add('show');
    } else if (type === 'error') {
        elements.errorPopup.classList.add('show');
    }
}

function closePopups() {
    elements.successPopup.classList.remove('show');
    elements.errorPopup.classList.remove('show');
}

function handlePopupClose() {
    resetForm();
    closePopups();
    setTimeout(() => {
        window.location.href = 'thankyou.html';
    }, 500);
}

function handleErrorClose() {
    closePopups();
    elements.yesBtn.disabled = false;
    elements.noBtn.disabled = false;
    state.isSubmitting = false;
}

function showErrorPopup(message) {
    elements.errorMessage.textContent = message;
    showPopup('error');
}

function resetForm() {
    elements.dateInput.value = '';
    elements.timeInput.value = '';
    elements.mealInput.value = '';
    elements.mealCards.forEach(card => card.classList.remove('selected'));
    state.selectedMeal = null;
    clearError('date');
    clearError('time');
    clearError('meal');
    elements.extraActions.style.display = 'none';
    state.isSubmitting = false;
    elements.yesBtn.disabled = false;
    elements.noBtn.disabled = false;
}

window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});