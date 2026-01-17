package com.charity.dto.request;


import com.charity.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is require")
    @Email(message = "Email mustbe vaild")
    private String email;

    @NotBlank(message = "Password is Required")
    @Size(min =6, message = "password must be atleast 6 characters")
    private  String password;

    @NotBlank(message = "Your full name is Required")
    private String fullName;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Ward is Required")
    private String ward;

    private UserRole role = UserRole.VIEWER; //Default role
}
