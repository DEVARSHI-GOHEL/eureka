import UIKit
import CoreML
import Vision

@available(iOS 15.0, *)
class ImageProcessor {
    private var model: VNCoreMLModel?
    
//    init(model: VNCoreMLModel) {
//        self.model = model
//    }
    
    func initialiseModel() {
        guard let configuredModel = try? FCNResNet101(configuration: MLModelConfiguration()) else {
            print("Could not load model")
            fatalError("Could not load model")
        }
        
        guard let visionModel = try? VNCoreMLModel(for: configuredModel.model) else {
            fatalError("Could not create VNCoreMLModel")
//            return nil
        }
        
        self.model = visionModel
    }
    
    func processImage(_ imageBuffer: CVPixelBuffer, completion: @escaping (Result<VNCoreMLFeatureValueObservation, Error>) -> Void) {
        
        
        if let model = self.model {
            let request = VNCoreMLRequest(model: model) { request, error in
                if let error = error {
                    completion(.failure(error))
                    return
                }
                
                guard let result = request.results?.first as? VNCoreMLFeatureValueObservation else {
                    completion(.failure(NSError(domain: "ImageProcessorError", code: -2, userInfo: [NSLocalizedDescriptionKey: "Invalid results"])))
                    return
                }
                
                completion(.success(result))
            }
            
            
            
            let handler = VNImageRequestHandler(cvPixelBuffer: imageBuffer, options: [:])
            do {
                try handler.perform([request])
            } catch {
                completion(.failure(error))
            }
        }
    }
}
