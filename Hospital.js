// Add this to your existing Hospital.js
document.addEventListener('DOMContentLoaded', function() {
  // Doctor search functionality
  const searchButton = document.getElementById('search-button');
  const sortDropdown = document.getElementById('sort-option');
  if (searchButton) {
      searchButton.addEventListener('click', function(e) {
          e.preventDefault();
          const doctorSearch = document.getElementById('doctor-search').value;
          const locationSearch = document.getElementById('location-search').value;
          
          searchDoctors(doctorSearch, locationSearch);
      });
  }
  if (sortDropdown) {
    sortDropdown.addEventListener('change', function() {
        const doctorSearch = document.getElementById('doctor-search').value;
        const locationSearch = document.getElementById('location-search').value;
        searchDoctors(doctorSearch, locationSearch);
    });
  }
  initBookingSystem();
});

function searchDoctors(specialization = '', location = '') {
  const sortOption = document.getElementById('sort-option').value.split(',');
  const sortBy = sortOption[0];
  const sortOrder = sortOption[1];

  // Get or create results container once (not on every search)
  let resultsContainer = document.getElementById('doctor-results');
  if (!resultsContainer) {
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'doctor-results';
    resultsContainer.className = 'doctor-results-container';
    document.querySelector('.appointment-search-container').after(resultsContainer);
  }

  // Add loading class for smooth transition
  resultsContainer.innerHTML = '<div class="loading-spinner"></div>';
  resultsContainer.style.opacity = '0.5';
  resultsContainer.style.transition = 'opacity 0.3s ease';

  const url = new URL('http://localhost/hospital-management-php/api/doctors.php');
  if (specialization) url.searchParams.append('specialization', specialization);
  if (location) url.searchParams.append('city', location); 
  url.searchParams.append('sort', sortBy);
  url.searchParams.append('order', sortOrder);

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      // Smooth transition to results
      setTimeout(() => {
        resultsContainer.style.opacity = '1';
        if (data.success) {
          displayDoctors(data.data);
        } else {
          resultsContainer.innerHTML = `
            <p class="error">Error: ${data.error || data.message || 'Unknown error'}</p>
          `;
        }
      }, 300);
    })
    .catch(error => {
      resultsContainer.innerHTML = `
        <p class="error">Failed to search doctors: ${error.message}</p>
      `;
      console.error('Search error:', error);
    });
}

function createResultsContainer() {
  const container = document.createElement('div');
  container.id = 'doctor-results';
  container.className = 'doctor-results-container';
  document.querySelector('.appointment-search-container').after(container);
  return container;
}

function displayDoctors(doctors) {
  const resultsContainer = document.getElementById('doctor-results');
  
  if (!doctors || doctors.length === 0) {
      resultsContainer.innerHTML = '<p class="no-results">No doctors found matching your criteria.</p>';
      return;
  }

  // console.group('Doctor Image Debugging');
  // console.log('Starting image preload for', doctors.length, 'doctors');

  // Preload images before rendering
  const preloadPromises = doctors.map(doctor => {
    return new Promise((resolve) => {
      const img = new Image();
      // console.log(`[${doctor.name}] Attempting to load: ${doctor.photo_url}`);
      
      img.src = doctor.photo_url;
      img.onload = () => {
        // console.log(`[${doctor.name}] Successfully loaded: ${doctor.photo_url}`);
        doctor.imageLoaded = true;
        resolve();
      };
      img.onerror = () => {
        console.warn(`[${doctor.name}] Failed to load: ${doctor.photo_url}. Falling back to default.`);
        doctor.photo_url = '/Hosptal_Management/images/doctors/default-doctor.jpg';
        doctor.fallbackUsed = true;
        resolve();
      };
    });
  });

  // Wait for all images to either load or fail
  Promise.all(preloadPromises).then(() => {
    // console.log('All images processed. Rendering doctor cards...');
    
    resultsContainer.innerHTML = doctors.map(doctor => {
      const imgTag = `<img src="${doctor.photo_url}" 
                       ${doctor.imageLoaded ? '' : 'onerror="this.src=\'/Hosptal_Management/images/doctors/default-doctor.jpg\'"'}
                       alt="${doctor.name}"
                       loading="lazy"
                       data-debug-original="${doctor.fallbackUsed ? 'failed' : doctor.photo_url}">`;
      
      // console.log(`[${doctor.name}] Final image tag:`, imgTag);
      // console.log("HOSPOS.............", doctor.photo_url);
      
      return `
        <div class="doctor-card" data-debug-id="${doctor.id}">
            <div class="doctor-image">
                ${imgTag}
                ${doctor.available ? '<span class="availability-badge">Available</span>' : '<span class="availability-badge unavailable">Not Available</span>'}
            </div>
            <div class="doctor-info">
                <h4>${doctor.name}</h4>
                <p class="specialization">${doctor.specialization}</p>
                <p class="location">${doctor.location}, ${doctor.city}</p>
                ${doctor.experience ? `<p class="experience">${doctor.experience} years experience</p>` : ''}
                <button class="book-btn" data-id="${doctor.id}" ${doctor.available ? '' : 'disabled'}>Book Appointment</button>
            </div>
        </div>`;
    }).join('');

    // console.log('Adding click handlers for booking buttons');
    document.querySelectorAll('.book-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const doctorId = this.getAttribute('data-id');
        // alert(`Booking appointment with doctor ID: ${doctorId}`);
      });
    });

    console.groupEnd();
  });
}

let selectedDoctorId = null;
const timeSlots = ['9-10am', '10-11am', '11-12pm', '1-2pm', '2-3pm', '3-4pm'];

// Function to initialize booking system
function initBookingSystem() {
    // Add click handler to all book buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('book-btn')) {
            selectedDoctorId = e.target.getAttribute('data-id');
            openBookingForm();
        }
    });

    document.getElementById('doctor-category').addEventListener('change', function() {
      const specialty = this.value;
      if (specialty) {
          searchDoctors(specialty, '');
      }
    });

    // Form submission handler
    const form = document.querySelector('.contact-form');
    form.addEventListener('submit', handleFormSubmit);
    
    // Date picker change handler
    const dateInput = document.getElementById('date');
    dateInput.addEventListener('change', function() {
        if (selectedDoctorId) {
            checkDoctorAvailability(selectedDoctorId, this.value);
        }
    });
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
}

function openBookingForm() {
  document.getElementById('form').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('doctor-category').value = 'general'; // Reset to default
}

function checkDoctorAvailability(doctorId, date) {
  const timeSlotSelect = document.getElementById('time-slot');
  timeSlotSelect.innerHTML = '<option value="" disabled selected>Loading available slots...</option>';
}

function checkDoctorAvailability(doctorId, date) {
  const timeSlotSelect = document.getElementById('time-slot');
  timeSlotSelect.innerHTML = '<option value="" disabled selected>Loading available slots...</option>';
  
  fetch(`http://localhost/hospital-management-php/api/appointments.php?doctor_id=${doctorId}&date=${date}`)
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              updateTimeSlots(data.booked_slots);
          }
      })
      .catch(error => {
          console.error('Error checking availability:', error);
          timeSlotSelect.innerHTML = '<option value="" disabled selected>Error loading slots</option>';
      });
}

function updateTimeSlots(bookedSlots) {
  const timeSlotSelect = document.getElementById('time-slot');
  timeSlotSelect.innerHTML = '<option value="" disabled selected>Select Time Slot</option>';
  
  timeSlots.forEach(slot => {
      if (!bookedSlots.includes(slot)) {
          const option = document.createElement('option');
          option.value = slot;
          option.textContent = slot;
          timeSlotSelect.appendChild(option);
      }
  });
  
  if (timeSlotSelect.options.length <= 1) {
      timeSlotSelect.innerHTML = '<option value="" disabled selected>No available slots</option>';
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  
  if (!selectedDoctorId) {
      showError('Please select a doctor first');
      return;
  }

  const form = event.target;
  const formData = {
      patient_name: document.getElementById('name').value,
      patient_email: document.getElementById('email').value,
      patient_phone: document.getElementById('mobile').value,
      doctor_id: selectedDoctorId,
      appointment_date: document.getElementById('date').value,
      time_slot: document.getElementById('time-slot').value,
      doctor_specialty: document.getElementById('doctor-category').value
  };

  // Simple validation
  if (!formData.patient_name || !formData.patient_email || !formData.patient_phone || 
      !formData.appointment_date || !formData.time_slot) {
      showError('Please fill all required fields');
      return;
  }

  form.classList.add('form-submitting');
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  form.appendChild(spinner);

  const submitBtn = event.target.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Booking...';

  fetch('http://localhost/hospital-management-php/api/appointments.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json', 
          'Accept': 'application/json'
      },
      body: JSON.stringify({
        patient_name: formData.patient_name,
        patient_email: formData.patient_email,
        patient_phone: formData.patient_phone,
        doctor_id: formData.doctor_id,
        appointment_date: formData.appointment_date,
        time_slot: formData.time_slot
      })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
  }
    return response.json();
    })
  .then(data => {
      if (data.success) {
        showSuccess('Appointment booked successfully!');
        form.reset();
        // Optional: Scroll to success message
        document.querySelector('.success-message').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
      } else {
          showError(`Error: ${data.error}`);
      }
  })
  .catch(error => {
      console.error('Error:', error);
      alert('Failed to book appointment. Please try again.');
  })
  .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Book Appointment';
      form.classList.remove('form-submitting');
      form.removeChild(spinner);
  });
}

function showSuccess(message) {
  const successMsg = document.createElement('div');
  successMsg.className = 'success-message';
  successMsg.textContent = message;
  document.body.appendChild(successMsg);
  
  // Trigger animation
  setTimeout(() => successMsg.classList.add('show'), 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
      successMsg.classList.remove('show');
      setTimeout(() => document.body.removeChild(successMsg), 300);
  }, 3000);
}

function showError(message) {
  const errorMsg = document.createElement('div');
  errorMsg.className = 'success-message';
  errorMsg.style.background = '#f44336';
  errorMsg.textContent = message;
  document.body.appendChild(errorMsg);
  
  setTimeout(() => errorMsg.classList.add('show'), 10);
  
  setTimeout(() => {
      errorMsg.classList.remove('show');
      setTimeout(() => document.body.removeChild(errorMsg), 300);
  }, 3000);
}

var swiper = new Swiper(".mySwiperservices", {
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
     
      700: {
        slidesPerView: 2,
        spaceBetween: 40,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 20,
      },
    },
  });

  var swiper = new Swiper(".mySwiperteam", {
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      560: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      950: {
        slidesPerView: 3,
        spaceBetween: 40,
      },
      1250: {
        slidesPerView: 4,
        spaceBetween: 50,
      },
    },
  });

  var swiper = new Swiper(".mySwipertesti", {
slidesPerView: 1,
spaceBetween: 10, 
pagination: {
  el: ".swiper-pagination",
  clickable: true, 
},
});



const form = document.querySelector('.contact-form');

form.addEventListener('submit', function (event) {
    event.preventDefault(); 

   
    const name = document.getElementById('name').value;
    const mobileNumber = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;
    const appointmentDate = document.getElementById('date').value;
    const timeSlot = document.getElementById('time-slot').value;
    const doctorCategory = document.getElementById('doctor-category').value;

    
    if (name === '' || mobileNumber === '' || email === '' || appointmentDate === '' || timeSlot === '' || doctorCategory === '') {
        alert('Please fill in all the fields.');
        return;
    }

    
    const appointmentDetails = {
        Name: name,
        MobileNumber: mobileNumber,
        Email: email,
        AppointmentDate: appointmentDate,
        TimeSlot: timeSlot,
        DoctorCategory: doctorCategory
    };

    console.log('Appointment Details:', appointmentDetails);

   
    // alert('Appointment booked successfully!');
});
