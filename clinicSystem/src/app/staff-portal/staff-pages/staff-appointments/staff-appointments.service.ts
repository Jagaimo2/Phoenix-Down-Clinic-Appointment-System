import { Injectable } from '@angular/core';
import {StaffService} from "../../staff.service";
import {HttpClient} from "@angular/common/http";
import {StaffappointmentModel} from "./staffappointment.model";
import {NgForm} from "@angular/forms";
import {Router} from "@angular/router";
import {LoginService} from "../../../login/login.service";

@Injectable({
  providedIn: 'root'
})
export class StaffAppointmentsService {

  allAppointments: StaffappointmentModel[] = [];
  appointment: any;
  prompt: string = 'Please specify the time that the patient must arrive in the clinic.';

  constructor(private http: HttpClient,
              private staffService: StaffService,
              private route: Router,
              private loginService: LoginService) { }

  getAppointments(){
    this.allAppointments = [];

    this.http.get(`${this.loginService.apiPath}/staff/clinic/appointments/${this.staffService.assignedClinic.id}`)
      .subscribe((response: any) => {
        for(let appointment of response.appointments){
          let newAppointment = new StaffappointmentModel(
            appointment.id,
            appointment.appointment_date,
            appointment.appointment_status,
            appointment.category,
            appointment.patient,
            appointment.doctor,
            appointment.clinic);

          this.allAppointments.push(newAppointment);
        }
      })
  }

  manageAppointment(form: NgForm, status: string){
    let formData = new FormData();

    if(status == 'Approved'){
      if(form.value.appointmentTime != ''){
        formData.append('time', form.value.appointmentTime);
        formData.append('status', status);

        this.http.post(`${this.loginService.apiPath}/staff/clinic/appointments/approveAppointment/${this.appointment.id}`, formData)
          .subscribe((response: any) => {

            this.prompt = response.message;
            setTimeout(() => {
              this.prompt = 'Please specify the time that the patient must arrive in the clinic.';
              this.route
                .navigate([`/staff/assignedClinics/${this.staffService.assignedClinic.id}/appointments`])
            }, 1500)
          })
      }
      else{
        this.prompt = 'Please enter a verified time before approving the appointment.';
        setTimeout(() => {
          this.prompt = 'Please specify the time that the patient must arrive in the clinic.';
        }, 3000)
      }
    }
    else if(status == 'Rejected'){
      formData.append('status', status);

      this.http.post(`${this.loginService.apiPath}/staff/clinic/appointments/approveAppointment/${this.appointment.id}`, formData)
        .subscribe((response: any) => {

          this.prompt = response.message;
          setTimeout(() => {
            this.prompt = this.prompt = 'Please specify the time that the patient must arrive in the clinic.';
            this.route
              .navigate([`/staff/assignedClinics/${this.staffService.assignedClinic.id}/appointments`])
          }, 1500)
        })
    }
  }
}
