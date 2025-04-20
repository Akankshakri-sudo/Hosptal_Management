// Add this to your existing Hospital.js
document.addEventListener('DOMContentLoaded', function() {
  // Doctor search functionality
  const searchButton = document.getElementById('search-button');
  if (searchButton) {
      searchButton.addEventListener('click', function(e) {
          e.preventDefault();
          const doctorSearch = document.getElementById('doctor-search').value;
          const locationSearch = document.getElementById('location-search').value;
          
          searchDoctors(doctorSearch, locationSearch);
      });
  }
});

function searchDoctors(specialization = '', location = '') {
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

  console.group('Doctor Image Debugging');
  console.log('Starting image preload for', doctors.length, 'doctors');

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
    console.log('All images processed. Rendering doctor cards...');
    
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
          </div>
          <div class="doctor-info">
              <h4>${doctor.name}</h4>
              <p class="specialization">${doctor.specialization}</p>
              <p class="location">${doctor.location}, ${doctor.city}</p>
              ${doctor.experience ? `<p class="experience">${doctor.experience} years experience</p>` : ''}
              <button class="book-btn" data-id="${doctor.id}">Book Appointment</button>
          </div>
      </div>`;
    }).join('');

    console.log('Adding click handlers for booking buttons');
    document.querySelectorAll('.book-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const doctorId = this.getAttribute('data-id');
        alert(`Booking appointment with doctor ID: ${doctorId}`);
      });
    });

    console.groupEnd();
  });
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

   
    alert('Appointment booked successfully!');
});
