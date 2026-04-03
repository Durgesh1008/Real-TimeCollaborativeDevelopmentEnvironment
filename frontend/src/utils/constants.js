export const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";


export const DEFAULT_CODE = {
    javascript: `// JavaScript
console.log("Hello, World!");

// Example function
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("JavaScript"));

// Try different examples:
// 1. Variables and data types
let number = 42;
let text = "Learning JavaScript";
let isActive = true;
console.log("Number:", number, "Text:", text, "Active:", isActive);

// 2. Arrays and loops
let fruits = ["apple", "banana", "orange"];
for (let fruit of fruits) {
    console.log("Fruit:", fruit);
}`,

    python: `# Python
print("Hello, World!")

# Example function
def greet(name):
    return f"Hello, {name}!"

print(greet("Python"))

# Try different examples:
# 1. Variables and data types
number = 42
text = "Learning Python"
is_active = True
print(f"Number: {number}, Text: {text}, Active: {is_active}")

# 2. Lists and loops
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(f"Fruit: {fruit}")

# 3. Simple calculation
def calculate_area(radius):
    return 3.14159 * radius * radius

radius = 5
area = calculate_area(radius)
print(f"Area of circle with radius {radius}: {area}")`,

    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Example method
        System.out.println(greet("Java"));
        
        // Try different examples:
        // 1. Variables and data types
        int number = 42;
        String text = "Learning Java";
        boolean isActive = true;
        System.out.println("Number: " + number + ", Text: " + text + ", Active: " + isActive);
        
        // 2. Arrays and loops
        String[] fruits = {"apple", "banana", "orange"};
        for (String fruit : fruits) {
            System.out.println("Fruit: " + fruit);
        }
        
        // 3. Simple calculation
        double radius = 5.0;
        double area = calculateArea(radius);
        System.out.println("Area of circle with radius " + radius + ": " + area);
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
    
    public static double calculateArea(double radius) {
        return 3.14159 * radius * radius;
    }
}`,

    cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Example function
string greet(string name) {
    return "Hello, " + name + "!";
}

// Calculate area function
double calculateArea(double radius) {
    return 3.14159 * radius * radius;
}

int main() {
    cout << "Hello, World!" << endl;
    cout << greet("C++") << endl;
    
    // Try different examples:
    // 1. Variables and data types
    int number = 42;
    string text = "Learning C++";
    bool isActive = true;
    cout << "Number: " << number << ", Text: " << text << ", Active: " << isActive << endl;
    
    // 2. Vectors and loops
    vector<string> fruits = {"apple", "banana", "orange"};
    for (const string& fruit : fruits) {
        cout << "Fruit: " << fruit << endl;
    }
    
    // 3. Simple calculation
    double radius = 5.0;
    double area = calculateArea(radius);
    cout << "Area of circle with radius " << radius << ": " << area << endl;
    
    return 0;
}`
};