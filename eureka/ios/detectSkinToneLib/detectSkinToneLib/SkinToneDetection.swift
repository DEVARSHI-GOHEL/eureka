//
//  SkinToneDetection.swift
//  SkinToneDetection
//
//  Created by prashant on 17/04/24.
//

import Foundation
import UIKit
import AVFoundation
import CoreML
import Vision

@available(iOS 15.0, *)
public class SkinToneDetection : NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {

    var captureSession: AVCaptureSession!
    var photoOutput: AVCapturePhotoOutput!
    var previewLayer: AVCaptureVideoPreviewLayer!
    var cropedImge  : UIImage = UIImage()
    let imageProcessor = ImageProcessor()

    public override init() {
        imageProcessor.initialiseModel()
    }
    
    public func skinToneDetectionMethod() -> String? {
        let skin = "skinToneDetectionMethod connected"
        return skin
    }
    
    public func displayImage(_ base64String: String) -> String? {
        print("base64String is : ", base64String)
        // Decode base64 string to data
        guard let imageData = Data(base64Encoded: base64String, options: []) else {
            print("Error: Invalid base64 string")
            return ""
        }
        
        // Convert data to UIImage
        guard let capturedImage = UIImage(data: imageData) else {
            print("Error: Failed to create image from base64 data")
            return ""
        }
        
        if let pixelBuffer = capturedImage.pixelBuffer(width: 512, height: 512) {
          imageProcessor.processImage(pixelBuffer, completion: { result in
            switch (result) {
            case .success(let prediction):
              print(prediction)
              let modelSuccess = Date()
              print(modelSuccess.timeIntervalSince1970)
              //                        if let feature = prediction.featureName {
              //                            if let output = prediction.featureValue {
              if let multiArray = prediction.featureValue.multiArrayValue {
                // Convert MLMultiArray to pixel buffer
                print("multiArray is : ", multiArray)
                
                let segmentationMap = self.createSegmentationMap(from: multiArray)
                
                // Convert segmentation map to UIImage
                let maskImage = self.createMaskImage(from: segmentationMap)!
                
                guard let cropImage = self.applyBinaryMask(originalImage: self.imageFromPixelBuffer(pixelBuffer: pixelBuffer)!, binaryMaskImage: maskImage) else { return }
                self.cropedImge = cropImage
                
                //            print("Final Image is generated here")
                //            self.findSkinTone(image: cropImage, colorArray: sortedColors)
                
              }
            case .failure(let error):
              print("error")
            }
          })
        }
        
        // Display the image (you can implement your own way of displaying the image)
//        let imageView = UIImageView(image: image)
//        imageView.contentMode = .scaleAspectFit
//        imageView.frame = UIScreen.main.bounds
//        UIApplication.shared.keyWindow?.addSubview(imageView)
        
        //        print("Image passed : ")
        return "Image passed : "
    }
    
    func createSegmentationMap(from segmentationMap: MLMultiArray) -> MLMultiArray {
      let height = 512
      let width = 512
      
      let classIndex = 1
      
      // Initialize a new MLMultiArray to store the mask for the specified class
      let mask = try? MLMultiArray(shape: [1, 512, 512], dataType: .float32)
      
      for y in 0..<height {
        for x in 0..<width {
          let probability = segmentationMap[classIndex*height*width + y*width + x].floatValue
          
          // Set the pixel value in the mask based on the probability for the specified class
          mask?[y*width + x] = probability as NSNumber
        }
      }
      
      return mask!
      
    }
    
    func createMaskImage(from segmentationMap: MLMultiArray) -> UIImage? {
      let height = 512
      let width = 512
      
      // Create a bitmap context to draw the mask image
      UIGraphicsBeginImageContextWithOptions(CGSize(width: width, height: height), false, 0.0)
      guard let context = UIGraphicsGetCurrentContext() else {
        return nil
      }
      
      // Iterate through each pixel in the segmentation map
      for y in 0..<height {
        for x in 0..<width {
          let probability = segmentationMap[y*width + x].floatValue
          
          // Determine the color based on the probability threshold
          let color: CGColor = probability > 0.1 ? UIColor.white.cgColor : UIColor.black.cgColor
          
          // Set the pixel color in the context
          context.setFillColor(color)
          context.fill(CGRect(x: x, y: y, width: 1, height: 1))
        }
      }
      
      // Get the mask image from the bitmap context
      guard let maskImage = UIGraphicsGetImageFromCurrentImageContext() else {
        return nil
      }
      
      // End the bitmap context
      UIGraphicsEndImageContext()
      
      return maskImage
    }
    func applyBinaryMask(originalImage: UIImage, binaryMaskImage: UIImage) -> UIImage? {
      guard let originalCGImage = originalImage.cgImage,
            let binaryMaskCGImage = binaryMaskImage.cgImage,
            let dataProvider = binaryMaskCGImage.dataProvider,
            let binaryMaskData = dataProvider.data,
            let binaryMaskPixels = CFDataGetBytePtr(binaryMaskData) else {
        return nil
      }
      
      let width = binaryMaskCGImage.width
      let height = binaryMaskCGImage.height
      
      // Create a bitmap context for blending the images
      guard let colorSpace = binaryMaskCGImage.colorSpace,
            let context = CGContext(data: nil,
                                    width: width,
                                    height: height,
                                    bitsPerComponent: 8,
                                    bytesPerRow: width * 4,
                                    space: colorSpace,
                                    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
        return nil
      }
      
      // Draw the original image
      context.draw(originalCGImage, in: CGRect(x: 0, y: 0, width: width, height: height))
      
      // Apply binary mask
      for y in 0..<height {
        for x in 0..<width {
          let offset = 4 * (y * width + x)
          let alpha = binaryMaskPixels[offset] // Assuming binary mask is black and white
          
          // Apply binary mask alpha to original image
          context.data?.storeBytes(of: alpha, toByteOffset: offset + 3, as: UInt8.self)
        }
      }
      
      // Create a new CGImage from the context
      guard let maskedCGImage = context.makeImage() else {
        return nil
      }
      
      // Convert CGImage to UIImage
      let maskedImage = UIImage(cgImage: maskedCGImage)
      
      return maskedImage
    }
    
    func imageFromPixelBuffer(pixelBuffer: CVPixelBuffer) -> UIImage? {
        let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
        let context = CIContext(options: nil)
        if let cgImage = context.createCGImage(ciImage, from: CGRect(x: 0, y: 0, width: CVPixelBufferGetWidth(pixelBuffer), height: CVPixelBufferGetHeight(pixelBuffer))) {
            return UIImage(cgImage: cgImage)
        }
        return nil
    }
}

extension UIImage {
    func pixelBuffer(width: Int, height: Int) -> CVPixelBuffer? {
        let attrs = [kCVPixelBufferCGImageCompatibilityKey: kCFBooleanTrue,
             kCVPixelBufferCGBitmapContextCompatibilityKey: kCFBooleanTrue] as CFDictionary
        
        var pixelBuffer: CVPixelBuffer?
        let status = CVPixelBufferCreate(kCFAllocatorDefault,
                                         width,
                                         height,
                                         kCVPixelFormatType_32ARGB,
                                         attrs,
                                         &pixelBuffer)
        
        guard let buffer = pixelBuffer, status == kCVReturnSuccess else {
            return nil
        }
        
        CVPixelBufferLockBaseAddress(buffer, CVPixelBufferLockFlags(rawValue: 0))
        let context = CGContext(data: CVPixelBufferGetBaseAddress(buffer),
                                width: width,
                                height: height,
                                bitsPerComponent: 8,
                                bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
                                space: CGColorSpaceCreateDeviceRGB(),
                                bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue)
        
        guard let cgImage = self.cgImage, let cgContext = context else {
            return nil
        }
        
        cgContext.draw(cgImage, in: CGRect(origin: .zero, size: CGSize(width: width, height: height)))
        CVPixelBufferUnlockBaseAddress(buffer, CVPixelBufferLockFlags(rawValue: 0))
        
        print("buffer is : ", buffer)
        return buffer
    }
  
  
}
