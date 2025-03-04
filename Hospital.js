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
